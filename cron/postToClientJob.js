const cron = require("node-cron");

/**
 * Registers a cron job that runs Monday-Friday at 6 PM EST and
 * sends eligible leads to the /post-to-client route.
 *
 * @param {mongoose.Model} Realtimelead - Mongoose model for realtimelead collection
 */
module.exports = function registerPostToClientJob(Realtimelead) {
  // Job function that processes leads
  const runPostToClientJob = async () => {
    try {
      console.log("[Cron] Starting post-to-client job");

      const now = new Date();
      const endDate = now;
      const startDate = new Date(now.getTime() - 240 * 60 * 60 * 1000); // last 24 hours

      const pipeline = [
        {
          $project: {
            retellCallEndedLogs: 0,
            retellDialedLogs: 0,
            scrub: 0,
            lastConcurrencyCheck: 0,
            requestBody: 0,
          },
        },
        {
          $unwind: {
            path: "$retellCallAnalysedLogs",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            dialedAt: {
              $toDate: "$retellCallAnalysedLogs.start_timestamp",
            },
            LeadsGetsDateTime: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
        },
        {
          $match: {
            // Restrict to production data and leads not yet posted to client
            postToClient: { $ne: true },
            env: "production",
            dialedAt: {
              $gte: startDate,
              $lte: endDate,
            },
            status: "XFER",
            "retellCallAnalysedLogs.disconnection_reason": "call_transfer",
          },
        },
        {
          $project: {
            _id: 0,
            phone: 1,
            fname: 1,
            lname: 1,
            city: 1,
            state: 1,
            email: 1,
            address: 1,
            zip: 1,
          },
        },
      ];

      const leads = await Realtimelead.aggregate(pipeline);

      if (!leads || leads.length === 0) {
        console.log(
          "[Cron] No eligible leads found for post-to-client job in last 24 hours"
        );
        return;
      }

      console.log(
        `[Cron] Found ${leads.length} leads to post to client (pre-validation)`
      );

      for (const lead of leads) {
        const body = {
          firstName: lead.fname,
          lastName: lead.lname,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          postalCode: lead.zip != null ? String(lead.zip) : "",
          phone: lead.phone != null ? String(lead.phone) : "",
          email: lead.email,
        };

        // Skip if ANY required field is null, undefined, or empty/whitespace
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
            `[Cron] Skipping lead for phone ${body.phone} due to missing/empty required field(s)`
          );
          continue;
        }

        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_BACKEND}/post-to-client`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );
        } catch (err) {
          console.error(
            `[Cron] Error posting phone ${body.phone} to client API`,
            err
          );
        }
      }

      console.log("[Cron] Completed post-to-client job");
    } catch (error) {
      console.error("[Cron] Failed post-to-client job:", error);
    }
  };

  // PRODUCTION: Uncomment below to enable regular cron schedule (Monday-Friday at 6 PM EST)
  // Cron format: minute hour day-of-month month day-of-week
  // Day of week: 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
  // "1-5" means Monday through Friday

  cron.schedule("* * * * 1-5", runPostToClientJob, {
    timezone: "America/New_York",
  });
};
