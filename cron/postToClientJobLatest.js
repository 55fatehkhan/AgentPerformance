const cron = require("node-cron");

/**
 * Runs Monday–Friday at 6 PM America/New_York.
 * Aggregates from transcriptions (call_analyzed + call_transfer in last 24h),
 * normalizes to_number -> 10-digit long, looks up realtimeleads by phone,
 * validates required fields, posts to /post-to-client,
 * then marks the realtimelead as postToClient=true.
 *
 * @param {mongoose.Model} Transcriptions - Mongoose model for transcriptions collection
 * @param {mongoose.Model} Realtimelead - Mongoose model for realtimeleads collection
 */
module.exports = function registerPostToClientJob(Transcriptions, Realtimelead) {
  const runPostToClientJob = async () => {
    try {
      console.log("[Cron] Starting post-to-client job (transcriptions -> realtimeleads)");

      // Dynamic rolling 24 hours window
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

      const realtimeLeadsCollection =
        Realtimelead?.collection?.name || "realtimeleads";

      const pipeline = [
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            "body.event": "call_analyzed",
            "body.call.disconnection_reason": "call_transfer",
          },
        },
        {
          $project: {
            createdAt: 1,
            "body.call.to_number": 1,
            "body.call.direction": 1,
          },
        },
        // 1) Remove leading '+' (substring logic, no regex)
        {
          $addFields: {
            to_number_str: { $ifNull: ["$body.call.to_number", ""] },
            to_number_no_plus: {
              $cond: [
                { $eq: [{ $substrCP: ["$body.call.to_number", 0, 1] }, "+"] },
                {
                  $substrCP: [
                    "$body.call.to_number",
                    1,
                    { $subtract: [{ $strLenCP: "$body.call.to_number" }, 1] },
                  ],
                },
                "$body.call.to_number",
              ],
            },
          },
        },
        // 2) Convert to 10 digits if starts with '1' and length is 11
        {
          $addFields: {
            to_number_10: {
              $cond: [
                {
                  $and: [
                    { $eq: [{ $strLenCP: "$to_number_no_plus" }, 11] },
                    { $eq: [{ $substrCP: ["$to_number_no_plus", 0, 1] }, "1"] },
                  ],
                },
                { $substrCP: ["$to_number_no_plus", 1, 10] },
                "$to_number_no_plus",
              ],
            },
          },
        },
        // 3) Only accept exactly 10 digits and convert to long
        {
          $addFields: {
            to_number_long: {
              $cond: [
                { $eq: [{ $strLenCP: "$to_number_10" }, 10] },
                {
                  $convert: {
                    input: "$to_number_10",
                    to: "long",
                    onError: null,
                    onNull: null,
                  },
                },
                null,
              ],
            },
          },
        },
        // 4) Keep only clean numbers
        { $match: { to_number_long: { $ne: null } } },

        // 5) Lookup realtimeleads by phone
        {
          $lookup: {
            from: realtimeLeadsCollection,
            localField: "to_number_long",
            foreignField: "phone",
            as: "lead",
          },
        },
        // Only keep matches (no lead => nothing to post)
        { $unwind: { path: "$lead", preserveNullAndEmptyArrays: false } },

        // Prevent reposting already-posted leads
        { $match: { "lead.postToClient": { $ne: true } } },

        {
          $project: {
            createdAt: 1,
            to_number: "$body.call.to_number",
            direction: "$body.call.direction",
            to_number_long: 1,

            LeadId: "$lead._id",
            BoughtDate: "$lead.createdAt",
            Datatype: "$lead.type",
            Phone: "$lead.phone",
            Firstname: "$lead.fname",
            Lastname: "$lead.lname",
            Email: "$lead.email",
            State: "$lead.state",
            City: "$lead.city",
            Address: "$lead.address",
            Zip: "$lead.zip",
          },
        },
      ];

      const rows = await Transcriptions.aggregate(pipeline);

      if (!rows || rows.length === 0) {
        console.log(
          `[Cron] No eligible joined leads found between ${startDate.toISOString()} and ${endDate.toISOString()}`
        );
        return;
      }

      console.log(`[Cron] Found ${rows.length} lead(s) to post (pre-validation)`);

      for (const r of rows) {
        const body = {
          firstName: r.Firstname,
          lastName: r.Lastname,
          address: r.Address,
          city: r.City,
          state: r.State,
          postalCode: r.Zip != null ? String(r.Zip) : "",
          phone: r.Phone != null ? String(r.Phone) : "",
          email: r.Email,
        };

        const requiredKeys = [
          "firstName",
          "lastName",
          "address",
          "city",
          "state",
          "postalCode",
          "phone",
          "email",
        ];

        const hasMissingField = requiredKeys.some((key) => {
          const value = body[key];
          if (value === null || value === undefined) return true;
          if (typeof value === "string" && value.trim() === "") return true;
          return false;
        });

        if (hasMissingField) {
          console.log(
            `[Cron] Skipping phone ${body.phone} due to missing/empty required field(s)`
          );
          continue;
        }

        try {
          const resp = await fetch(
            `${process.env.REACT_APP_API_BACKEND}/post-to-client`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          );

          if (!resp.ok) {
            const text = await resp.text().catch(() => "");
            console.error(
              `[Cron] Client API failed for phone ${body.phone}: ${resp.status} ${resp.statusText} ${text}`
            );
            continue; // don't mark posted
          }

          // Mark the realtime lead as posted after successful API call
          if (r.LeadId) {
            await Realtimelead.updateOne(
              { _id: r.LeadId },
              { $set: { postToClient: true, postToClientAt: new Date() } }
            ).catch((e) => {
              console.error(
                `[Cron] Posted but failed to mark postToClient for phone ${body.phone}`,
                e
              );
            });
          }
        } catch (err) {
          console.error(`[Cron] Error posting phone ${body.phone}`, err);
        }
      }

      console.log("[Cron] Completed post-to-client job (transcriptions -> realtimeleads)");
    } catch (error) {
      console.error("[Cron] Failed post-to-client job:", error);
    }
  };

    // cron.schedule("0 21 * * 1-5", runPostToClientJob, {
    // timezone: "America/New_York",
    // });

      cron.schedule("*/2 * * * *", runPostToClientJob, {
    timezone: "America/New_York",
  });
};