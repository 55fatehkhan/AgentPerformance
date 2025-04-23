require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.REACT_APP_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

//mongoose.set("debug", true);    

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    center: { type: String, required: true }
});

const User = mongoose.model('user', userSchema);

// ClientReport
const ClientReportSchema = new mongoose.Schema({
    centerName: String,
    provider: String,
    fromDate: Date,
    toDate: Date,
    Month: String,
    BiweeklyDate: String
});

const ClientReport = mongoose.model('clientreportanalysi', ClientReportSchema);

const runtimeSchema = new mongoose.Schema({
    dialedAt: Date,
    campaignId: String,
    centerName: String, 
    provider: String   
});

const RuntimeReport = mongoose.model('runtimelog', runtimeSchema);

const threewaySchema = new mongoose.Schema({
    dialedAt: Date,
    campaignId: String,
    centerName: String, 
    provider: String   
});

const ThreewayReport = mongoose.model('threewaylog', threewaySchema);

const reportSchema = new mongoose.Schema({
    agentName: String,
    status: String,
    dialedAt: Date,
    campaignId: String,
    centerName: String, 
    provider: String   
});

const Report = mongoose.model('dialerdailyreport', reportSchema);

const contactSchema = new mongoose.Schema({
    phone: String,
    dataset: String,
    listId: String
});
const Contact = mongoose.model('contact', contactSchema);

const threeWaySchema = new mongoose.Schema({
    phone: String,
    reportDate: Date,
    duration: Number,
    date: Date,
    provider: String,
    center: String,
    campaign: String

});
const ThreeWayReport = mongoose.model('threewayreport', threeWaySchema);

// Schema and Model for voipcosts
const voipCostSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    totalCost: { type: Number, required: true },
    provider: { type: String, required: true },
    center: { type: String, required: true }
});

const VoipCost = mongoose.model('voipcost', voipCostSchema);

// Define the schema and model for MongoDB collection AgentSaleReport Inbound Vs Outbound

const agentSaleSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    provider: { type: String, required: true },
    center: { type: String, required: true },
    campaign: {type: String, required: true}
});

const Paidlead = mongoose.model('paidlead', agentSaleSchema);

const retellcall = new mongoose.Schema({
    date: { type: Date, required: true },
    duration: { type: Number },
    direction: { type: String, required: true },
    call_disposition: {type: String, required: true},
    disconnect_reason: {type: String, required: true}
});

const Realtimelead = mongoose.model('realtimelead', retellcall);

// for inbound - in transcriptions collection
const retellInboundcall = new mongoose.Schema({
    date: { type: Date, required: true }
});
const InboundLeads = mongoose.model('transcription', retellInboundcall);

// Function to get campaign IDs based on center name, provider, and campaign type
const getCampaignIds = (center, provider, campaign) => {
    if (center === 'Shark') {
        if (provider === 'telcast') {
            if (campaign === 'Outbound') return ["SH_HomeWarrantyGold", "SH_HomeWarrantyGold ", "SH_HomeWarrantyGold2", "SH_HomeWarrantyGold2 ", "Shark_HomeWarrantyGold "];
            if (campaign === 'Inbound') return ["Inbound Campaign", "Inbound Inbound Campaign "];
            if (campaign === 'Both') return ["SH_HomeWarrantyGold", "SH_HomeWarrantyGold ", "SH_HomeWarrantyGold2", "SH_HomeWarrantyGold2 ", "Shark_HomeWarrantyGold ", "Inbound Campaign", "Inbound Inbound Campaign "];
        } else if (provider === 'phdialer') {
            if (campaign === 'Outbound') return ["HW", "HW_2"];
            if (campaign === 'Inbound') return ["CallerID", "INBOUNDH", "HWXFER"];
            if (campaign === 'Both') return ["HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER"];
        } else if (provider === 'Both') {
            if (campaign === 'Outbound') return ["SH_HomeWarrantyGold", "SH_HomeWarrantyGold ", "SH_HomeWarrantyGold2", "SH_HomeWarrantyGold2 ", "Shark_HomeWarrantyGold ", "HW", "HW_2"];
            if (campaign === 'Inbound') return ["Inbound Campaign", "Inbound Inbound Campaign ", "CallerID", "INBOUNDH", "HWXFER"];
            if (campaign === 'Both') return ["SH_HomeWarrantyGold", "SH_HomeWarrantyGold ", "SH_HomeWarrantyGold2", "SH_HomeWarrantyGold2 ", "Shark_HomeWarrantyGold ", "HW", "HW_2", "Inbound Campaign", "Inbound Inbound Campaign ", "CallerID", "INBOUNDH", "HWXFER" ];
        }
    } else if (center === 'Fortune') {
        if (provider === 'telcast') {
            if (campaign === 'Outbound') return ["FORTUNE_JARED", "FORTUNE_JARED ", "FT_HomeWarranty", "FT_HomeWarranty "];
            if (campaign === 'Inbound') return ["FT_Inbound_CB ", "Inbound Campaign", "Inbound Campaign "];
            if (campaign === 'Both') return ["FORTUNE_JARED", "FORTUNE_JARED ", "FT_HomeWarranty", "FT_HomeWarranty ", "FT_Inbound_CB ", "Inbound Campaign", "Inbound Campaign "];
        }
    } 
    return [];
};

// Retell Call logs Report API
app.post('/api/RetellCallLogs', async (req, res) => {
    const { direction, duration, fromDate, toDate, call_disposition, disconnect_reason } = req.body;
  //  console.log(direction, duration, fromDate, toDate, call_disposition, disconnect_reason);

    // Helper function to ensure all inputs are arrays where necessary
    const ensureArray = input => Array.isArray(input) ? input : input ? [input] : [];

    // Construct dynamic match conditions based on user input
    let matchConditions1 = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        },
        "retellCallAnalysedLogs.direction": { $in: ensureArray(direction) || ["inbound", "outbound"] }
    };

    let matchConditions2 = {
        duration_second: { $gte: Number(duration) || 0 }
    };

    // if (call_disposition) {
    //     matchConditions2["retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition"] = { $in: ensureArray(call_disposition) };
    // }

     // Only add disposition condition if 'All' is not selected
     if (call_disposition && !call_disposition.includes("All")) {
        matchConditions2["retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition"] = { $in: ensureArray(call_disposition) };
    }

    if (disconnect_reason) {
        matchConditions2["retellCallAnalysedLogs.disconnection_reason"] = { $in: ensureArray(disconnect_reason) };
    }

   // console.log("Matched1:  ", matchConditions1);
   // console.log("Matched2:  ", matchConditions2);

    const pipeline = [
        { $unwind: { path: "$retellCallAnalysedLogs", preserveNullAndEmptyArrays: false } },
        { $addFields: {
            dialedAt: { $toDate: "$retellCallAnalysedLogs.start_timestamp" },
            LeadsGetsDateTime: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        }},
        { $match: matchConditions1 },
        { $addFields: { duration_second: { $divide: ["$retellCallAnalysedLogs.duration_ms", 1000] } }},
        { $match: matchConditions2 },
        { $project: {
            _id: 0,
            DialedAt: "$dialedAt",
            from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
            to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
            direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
            duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000] }, 0] }, 0] },
            recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
            disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
            call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
            call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
            //call_id: "$retellCallAnalysedLogs.call_id",
            latency: "$retellCallAnalysedLogs.latency.e2e.p50",
            LeadsGetsDateTime: 1
        }}
    ];

     // console.log('pipeline:  ', pipeline);
     // console.log(JSON.stringify(pipeline, null, 2));

    try {
        const results = await Realtimelead.aggregate(pipeline);
        // console.log('Output: ', results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Retell Disconnects Call logs Report API
app.post('/api/RetellDisconnectedCall', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic match conditions based on user input
    let matchConditions1 = {
        createdAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        } };

    const pipeline = [
        {
            $match: matchConditions1
        },
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $match: {
                "retellCallAnalysedLogs.disconnection_reason": "dial_failed"
            }
        },
        {
            $group: {
                _id: "$phone",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $match: {
                count: {
                    $gte: 6
                }
            }
        },
        {
            $project: {
                phone: "$_id",
                count: 1,
                _id: 0
            }
        }
  
    ];
    try {
        const results = await Realtimelead.aggregate(pipeline);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// DID Connects Rate Report
app.post('/api/RetellDIDConnectsRate', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                includeArrayIndex: "dial_index",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $addFields: {
                did: {
                    $cond: {
                        if: { $eq: ["$retellCallAnalysedLogs.direction", "inbound"] },
                        then: "$retellCallAnalysedLogs.to_number",
                        else: "$retellCallAnalysedLogs.from_number"
                    }
                }
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellCallAnalysedLogs.start_timestamp"
                },
                createdAtSimple: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $project: {
                from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
                to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
                direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
                duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000]}, 0]}, 0]},
                recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
                disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
                call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
                call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
                call_id: "$retellCallAnalysedLogs.call_id",
                latency: "$retellCallAnalysedLogs.latency.e2e.p50",
                createdAtSimple: 1,
                dial_index: 1,
                subId: 1,
                source: 1,
                campaign: 1,
                did: 1,
                _id: 0
            }
        },
        {
            $addFields: {
                classification: {
                    $cond: {
                        if: {
                            $in: ["$call_disposition", ["CALLBK", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "Xferh", "LB", "HO", "AFTHRS", "BN", "CALLBK", "DEC", "DNC", "DROP", "HU", "INXFER", "LB", "NHO", "NI", "NQ", "RQXFER", "SALE", "TEST", "TIMEOT", "WN", "XFER"]]
                        },
                        then: "HUMAN",
                        else: "MACHINE"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$did",
                Human: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "HUMAN"] },
                            1,
                            0
                        ]
                    }
                },
                Machine: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "MACHINE"] },
                            1,
                            0
                        ]
                    }
                },
                GrandTotal: { $sum: 1 }
            }
        },
        {
            $addFields: {
                "Human Answer%": {
                    $round: [
                        { $multiply: [{ $divide: ["$Human", "$GrandTotal"] }, 100] },
                        2
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                agentsData: { $push: "$$ROOT" },
                totalHuman: { $sum: "$Human" },
                totalMachine: { $sum: "$Machine" },
                totalGrandTotal: { $sum: "$GrandTotal" }
            }
        },
        {
            $addFields: {
                totals: {
                    _id: "Grand Total",
                    Human: "$totalHuman",
                    Machine: "$totalMachine",
                    GrandTotal: "$totalGrandTotal"
                }
            }
        },
        {
            $project: {
                finalResult: { $concatArrays: ["$agentsData", ["$totals"]] }
            }
        },
        {
            $unwind: "$finalResult"
        },
        {
            $replaceRoot: {
                newRoot: "$finalResult"
            }
        }
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Carrier Connects Rate Report
app.post('/api/RetellCarrierConnectsRate', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                includeArrayIndex: "dial_index",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $addFields: {
                did: {
                    $cond: {
                        if: { $eq: ["$retellCallAnalysedLogs.direction", "inbound"] },
                        then: "$retellCallAnalysedLogs.to_number",
                        else: "$retellCallAnalysedLogs.from_number"
                    }
                }
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellCallAnalysedLogs.start_timestamp"
                },
                createdAtSimple: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $lookup: {
                from: "ipqslogs",
                localField: "phone",
                foreignField: "phone",
                as: "ipqs"
            }
        },
        {
            $addFields: {
                ipqs: {
                    $reduce: {
                        input: "$ipqs",
                        initialValue: {},
                        in: {
                          $mergeObjects: ["$$value", "$$this"]
                        }
                      }
                    }
                }
            },
        {
            $project: {
                from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
                to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
                direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
                duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000]}, 0]}, 0]},
                recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
                disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
                call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
                call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
                call_id: "$retellCallAnalysedLogs.call_id",
                latency: "$retellCallAnalysedLogs.latency.e2e.p50",
                createdAtSimple: 1,
                dial_index: 1,
                subId: 1,
                source: 1,
                campaign: 1,
                carrier: "$ipqs.responseBody.carrier",
                did: 1,
                _id: 0
            }
        },
        {
            $addFields: {
                classification: {
                    $cond: {
                        if: {
                            $in: ["$call_disposition", ["CALLBK", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "Xferh", "LB", "HO", "AFTHRS", "BN", "CALLBK", "DEC", "DNC", "DROP", "HU", "INXFER", "LB", "NHO", "NI", "NQ", "RQXFER", "SALE", "TEST", "TIMEOT", "WN", "XFER"]]
                        },
                        then: "HUMAN",
                        else: "MACHINE"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$carrier",
                Human: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "HUMAN"] },
                            1,
                            0
                        ]
                    }
                },
                Machine: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "MACHINE"] },
                            1,
                            0
                        ]
                    }
                },
                GrandTotal: { $sum: 1 }
            }
        },
        {
            $addFields: {
                "Human Answer%": {
                    $round: [
                        { $multiply: [{ $divide: ["$Human", "$GrandTotal"] }, 100] },
                        2
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                agentsData: { $push: "$$ROOT" },
                totalHuman: { $sum: "$Human" },
                totalMachine: { $sum: "$Machine" },
                totalGrandTotal: { $sum: "$GrandTotal" }
            }
        },
        {
            $addFields: {
                totals: {
                    _id: "Grand Total",
                    Human: "$totalHuman",
                    Machine: "$totalMachine",
                    GrandTotal: "$totalGrandTotal"
                }
            }
        },
        {
            $project: {
                finalResult: { $concatArrays: ["$agentsData", ["$totals"]] }
            }
        },
        {
            $unwind: "$finalResult"
        },
        {
            $replaceRoot: {
                newRoot: "$finalResult"
            }
        }
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Human Answer HA, per attempt
app.post('/api/RetellHAPerAttemptCount', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                includeArrayIndex: "dial_index",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellCallAnalysedLogs.start_timestamp"
                },
                createdAtSimple: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $project: {
                from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
                to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
                direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
                duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000]}, 0]}, 0]},
                recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
                disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
                call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
                call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
                call_id: "$retellCallAnalysedLogs.call_id",
                latency: "$retellCallAnalysedLogs.latency.e2e.p50",
                createdAtSimple: 1,
                dial_index: 1,
                subId: 1,
                source: 1,
                campaign: 1,
                carrier: "$ipqs.responseBody.carrier",
                did: 1,
                _id: 0
            }
        },
        {
            $addFields: {
                classification: {
                    $cond: {
                        if: {
                            $in: ["$call_disposition", ["CALLBK", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "Xferh", "LB", "HO", "AFTHRS", "BN", "CALLBK", "DEC", "DNC", "DROP", "HU", "INXFER", "LB", "NHO", "NI", "NQ", "RQXFER", "SALE", "TEST", "TIMEOT", "WN", "XFER"]]
                        },
                        then: "HUMAN",
                        else: "MACHINE"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$dial_index",
                Human: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "HUMAN"] },
                            1,
                            0
                        ]
                    }
                },
                Machine: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "MACHINE"] },
                            1,
                            0
                        ]
                    }
                },
                GrandTotal: { $sum: 1 }
            }
        },
        {
            $sort: {
                _id: 1
            }
        },
        {
            $addFields: {
                "Human Answer%": {
                    $round: [
                        { $multiply: [{ $divide: ["$Human", "$GrandTotal"] }, 100] },
                        2
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                agentsData: { $push: "$$ROOT" },
                totalHuman: { $sum: "$Human" },
                totalMachine: { $sum: "$Machine" },
                totalGrandTotal: { $sum: "$GrandTotal" }
            }
        },
        {
            $addFields: {
                totals: {
                    _id: "Grand Total",
                    Human: "$totalHuman",
                    Machine: "$totalMachine",
                    GrandTotal: "$totalGrandTotal"
                }
            }
        },
        {
            $project: {
                finalResult: { $concatArrays: ["$agentsData", ["$totals"]] }
            }
        },
        {
            $unwind: "$finalResult"
        },
        {
            $replaceRoot: {
                newRoot: "$finalResult"
            }
        }
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Call Count/attempt on each leads by day and their timestamp
app.post('/api/RetellCallCountOnLeads', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $unwind: {
                path: "$retellDialedLogs",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellDialedLogs.createdAt"
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $group: {
                    _id: "$_id",
  phone: {
    $first: "$phone"
  },
  fname: {
    $first: "$fname"
  },
  lname: {
    $first: "$lname"
  },
  status: {
    $first: "$status"
  },
  leadId: {
    $first: "$leadId"
  },
  campaign: {
    $first: "$campaign"
  },
  createdAt: {
    $first: "$createdAt"
  },
  callAttempts: {
    $sum: 1
  },
  allCalls: {
    $push: "$retellDialedLogs.createdAt"
  }
            }
        },
        {
            $project: {
                _id: 0,
                "Phone Number": "$phone",
                "First Name": "$fname",
                "Last Name": "$lname",
                Status: "$status",
                "Lead ID": "$leadId",
                Campaign: "$campaign",
                CreatedAt: "$createdAt",
                "Total Calls": "$callAttempts",
                "Call Attempt 1": {
                  $arrayElemAt: ["$allCalls", 0]
                },
                "Call Attempt 2": {
                  $arrayElemAt: ["$allCalls", 1]
                },
                "Call Attempt 3": {
                  $arrayElemAt: ["$allCalls", 2]
                },
                "Call Attempt 4": {
                  $arrayElemAt: ["$allCalls", 3]
                },
                "Call Attempt 5": {
                  $arrayElemAt: ["$allCalls", 4]
                },
                "Call Attempt 6": {
                  $arrayElemAt: ["$allCalls", 5]
                },
                "Call Attempt 7": {
                  $arrayElemAt: ["$allCalls", 6]
                },
                "Call Attempt 8": {
                  $arrayElemAt: ["$allCalls", 7]
                },
                "Call Attempt 9": {
                  $arrayElemAt: ["$allCalls", 8]
                },
                "Call Attempt 10": {
                  $arrayElemAt: ["$allCalls", 9]
                }
            }
        },
        {
            $sort: {
                "Total Calls": -1
            }
        }
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Leads Dial Count Date Wise
app.post('/api/RetellLeadsDialCountDateWise', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellCallAnalysedLogs.start_timestamp"
                },
                createdAtSimple: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $project: {
                from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
                to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
                direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
                duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000]}, 0]}, 0]},
                recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
                disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
                call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
                call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
                call_id: "$retellCallAnalysedLogs.call_id",
                latency: "$retellCallAnalysedLogs.latency.e2e.p50",
                createdAtSimple: 1,
                dial_index: 1,
                _id: 0,
                phone: 1
            }
        },
        {
            $group: {
                    _id: {
                    phone: "$phone",
                    date: "$createdAtSimple"
                    //direction: "$direction",
                    //disconnect_reason: "$disconnect_reason",
                    //call_disposition: "$call_disposition"
                },
                count: {
                    $sum: 1
                }
            }
        },
       
        {
            $project: {
                date: "$_id.date",
                phone: "$_id.phone",
                direction: "$_id.direction",
                 disconnect_reason: "$_id.disconnect_reason",
                 call_disposition: "$_id.call_disposition",
                  count: 1,
                     _id: 0
            }
        }
        
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Attempt Count before Transfer and lead belong from which date
app.post('/api/RetellAttemptCount', async (req, res) => {
    const { call_disposition, disconnect_reason } = req.body;
  //  console.log(call_disposition, disconnect_reason);

    // Helper function to ensure all inputs are arrays where necessary
    const ensureArray = input => Array.isArray(input) ? input : input ? [input] : [];

   // Define match conditions dynamically based on input
   let matchConditions = {};

     // Only add disposition condition if 'All' is not selected
     if (call_disposition && !call_disposition.includes("All")) {
        matchConditions["retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition"] = { $in: ensureArray(call_disposition) };
    }

    if (disconnect_reason) {
        matchConditions["retellCallAnalysedLogs.disconnection_reason"] = { $in: ensureArray(disconnect_reason) };
    }
   // console.log("Matched2:  ", matchConditions2);

    const pipeline = [
        { $match: matchConditions },
        { $project: {
            phone: 1,
            attempbeforeXFER: {
                $size: "$retellCallAnalysedLogs"
              },
              createdAt: 1
        }}
    ];
     // console.log(JSON.stringify(pipeline, null, 2));
    try {
        const results = await Realtimelead.aggregate(pipeline);
        // console.log('Output: ', results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Transfer Count on Each Attempt
app.post('/api/RetellTransferInEachAttempt', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $project: {
                retellDialedLogs: 0,
                retellCallEndedLogs: 0
            }
        },
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                includeArrayIndex: "dial_index",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $match: {
                "retellCallAnalysedLogs.disconnection_reason":
                    "call_transfer"
            }
        },
        {
            $addFields: {
                did: {
                    $cond: {
                        if: { $eq: ["$retellCallAnalysedLogs.direction", "inbound"] },
                        then: "$retellCallAnalysedLogs.to_number",
                        else: "$retellCallAnalysedLogs.from_number"
                    }
                }
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellCallAnalysedLogs.start_timestamp"
                },
                createdAtSimple: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $project: {
                from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
                to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
                direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
                duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000]}, 0]}, 0]},
                recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
                disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
                call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
                call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
                call_id: "$retellCallAnalysedLogs.call_id",
                latency: "$retellCallAnalysedLogs.latency.e2e.p50",
                createdAtSimple: 1,
                dial_index: 1,
                did: 1,
                _id: 0
            }
        },
        {
            $group: {
                _id: {
                    disconnect_reason: "$disconnect_reason",
                    dial_index: "$dial_index"
                  },
                  count: {
                    $sum: 1
                  }
            }
        },
        {
            $project: {
                disconnect_reason: "$_id.disconnect_reason",
                dial_index: "$_id.dial_index",
                 count: 1,
                 _id: 0
            }
        }
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Twillio Recordings
app.post('/api/twilioRecording', async (req, res) => {
    const { phone } = req.body;  

    let matchConditions = {
        phone: parseInt(phone)  // Convert phone number to integer for comparison if needed
    };

    const pipeline = [
        {
            $match: matchConditions
        },
        {
            $project: {
                phone: 1,
                retellCallAnalysedLogs: {
                    $arrayElemAt: [
                        { $reverseArray: "$retellCallAnalysedLogs" }, 0
                    ]
                }
            }
        },
        {
            $project: {
                twilioCallSid: "$retellCallAnalysedLogs.twilioCallSid"
            }
        },
        {
            $lookup: {
                from: "twiliologs",  
                localField: "twilioCallSid", 
                foreignField: "twilioCallSid",  
                as: "twilioData"
            }
        },
        {
            $unwind: "$twilioData"
        },
        {
            $project: {
                twilioRecordingUrl: "$twilioData.twilioRecordingUrl" 
            }
        }
    ];

    // console.log("Pipeline: ", pipeline);
    try {
        // Run the aggregation to get the twilioRecordingUrl
        const results = await Realtimelead.aggregate(pipeline);
        // console.log("TwillioPiplelineResult", results);

        // Check if results are available
        if (results.length > 0) {
            const twilioRecordingUrl = results[0].twilioRecordingUrl;

            // Safely replace the TWILIO_ACCOUNT_SID here, outside of the pipeline
        const twilioRecordingUrlWithSid = twilioRecordingUrl.replace(
            'TWILIO-ACCOUNT-SID', 
            process.env.TWILIO_ACCOUNT_SID
        );

            // Now, let's authenticate with Twilio and fetch the recording info
            const Username = process.env.TWILIO_USERNAME;
            const Password = process.env.TWILIO_PASSWORD;

           // console.log("TwillioRecoridngFinal: ", twilioRecordingUrlWithSid);
            
            // Making the request to Twilio with the recording URL using fetch
            const response = await fetch(twilioRecordingUrlWithSid, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${Username}:${Password}`).toString('base64')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch Twilio recording details');
            }

            // Parse the JSON response from Twilio
            const data = await response.json();

            // Extract the media_url from the response
            const mediaUrl = data.media_url;

            // Return the media_url to the frontend
            res.status(200).json({ mediaUrl });

        } else {
            res.status(404).json({ error: "No matching record found" });
        }
    } catch (error) {
        console.error('Error running aggregation or Twilio request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Retell Inbound calls
app.post('/api/RetellInboundCalls', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        createdAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        },
        "body.event": "call_analyzed", 
        "body.call.direction": "inbound"
    };

    console.log("Matchedconditon: ", dateMatchCondition);

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $sort: {
               _id: -1
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellDialedLogs.createdAt"
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $lookup: {
                from: "twiliologs",
                localField: "body.call.telephony_identifier.twilio_call_sid",
                foreignField: "twilioCallSid",
                as: "twilio"
            }
        },
        {
            $unwind: {
                    path: "$twilio",
                    preserveNullAndEmptyArrays: false
            }
        },
        {
            $project: {
                from: {
                    $ifNull: ["$body.call.from_number", ""]
                  },
                  to: {
                    $ifNull: ["$body.call.to_number", ""]
                  },
                  direction: {
                    $ifNull: ["$body.call.direction", ""]
                  },
                  retell_duration_seconds: {
                    $round: [
                      {
                        $ifNull: [
                          {
                            $divide: [
                              "$body.call.duration_ms",
                              1000
                            ]
                          },
                          0
                        ]
                      },
                      0
                    ]
                  },
                  recording_url: {
                    $ifNull: ["$twilio.twilioRecordingUrl", ""]
                  },
                  disconnect_reason: {
                    $ifNull: [
                      "$body.call.disconnection_reason",
                      ""
                    ]
                  },
                  retell_call_cost: {
                    $divide: [
                      "$body.call.call_cost.combined_cost",
                      100
                    ]
                  },
                  call_disposition:
                    "$body.call.call_analysis.custom_analysis_data.call_disposition",
                  retell_call_id: "$body.call.call_id",
                  latency: "$body.call.latency.e2e.p50",
                  totalCost: {
                    $add: [
                      "$body.call.call_cost.combined_cost",
                      "$twilio.twilioCallCost",
                      "$twilio.twilioRecordingCost"
                    ]
                  },
                  createdAtSimple: 1,
                  twilioCallDuration:
                    "$twilio.twilioRecordingDuration",
                  twilioCallDurationWithRing:
                    "$twilio.twilioCallDuration",
                  // dial_index: 1,
                  // subId: 1,
                  // source: 1,
                  // campaign: 1,
                  // did: 1,
                  _id: 0,
                  createdAt: 1
             
            }
        },
        {
            $addFields:  {
                durationPostTransfer: {
                $subtract: [
                "$retell_duration_seconds",
                "$twilioCallDurationWithRing"
                ]
                }
            }
        }
    ];

    try {
        const results = await InboundLeads.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Human Answer HA by LineType
app.post('/api/RetellHAperLineType', async (req, res) => {
    const { fromDate, toDate } = req.body;

    // Construct dynamic date matching condition based on user input
    let dateMatchCondition = {
        dialedAt: {
            $gte: fromDate ? new Date(fromDate + "T11:30:00Z") : new Date('1970-01-01T11:30:00Z'),
            $lte: toDate ? new Date(toDate + "T11:30:00Z") : new Date()
        }
    };

    // MongoDB aggregation pipeline
    const pipeline = [
        {
            $unwind: {
                path: "$retellCallAnalysedLogs",
                includeArrayIndex: "dial_index",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $addFields: {
                did: {
                    $cond: {
                        if: { $eq: ["$retellCallAnalysedLogs.direction", "inbound"] },
                        then: "$retellCallAnalysedLogs.to_number",
                        else: "$retellCallAnalysedLogs.from_number"
                    }
                }
            }
        },
        {
            $addFields: {
                dialedAt: {
                    $toDate: "$retellCallAnalysedLogs.start_timestamp"
                },
                createdAtSimple: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                    }
                }
            }
        },
        {
            $match: dateMatchCondition
        },
        {
            $lookup: {
                from: "ipqslogs",
                localField: "phone",
                foreignField: "phone",
                as: "ipqs"
            }
        },
        {
            $addFields: {
                    ipqs: {
                    $reduce: {
                    input: "$ipqs",
                    initialValue: {},
                    in: {
                        $mergeObjects: ["$$value", "$$this"]
                    }
                    }
                }
            }
        },
        {
            $project: {
                from: { $ifNull: ["$retellCallAnalysedLogs.from_number", ""] },
                to: { $ifNull: ["$retellCallAnalysedLogs.to_number", ""] },
                direction: { $ifNull: ["$retellCallAnalysedLogs.direction", ""] },
                duration_seconds: { $round: [{ $ifNull: [{ $divide: ["$retellCallAnalysedLogs.duration_ms", 1000]}, 0]}, 0]},
                recording_url: { $ifNull: ["$retellCallAnalysedLogs.recording_url", ""] },
                disconnect_reason: { $ifNull: ["$retellCallAnalysedLogs.disconnection_reason", ""] },
                call_cost: { $divide: ["$retellCallAnalysedLogs.call_cost.combined_cost", 100] },
                call_disposition: "$retellCallAnalysedLogs.call_analysis.custom_analysis_data.call_disposition",
                call_id: "$retellCallAnalysedLogs.call_id",
                latency: "$retellCallAnalysedLogs.latency.e2e.p50",
                createdAtSimple: 1,
                dial_index: 1,
                subId: 1,
                source: 1,
                campaign: 1,
                did: 1,
                carrier: "$ipqs.responseBody.carrier",
                LineType: "$ipqs.responseBody.line_type",
                _id: 0
            }
        },
        {
            $addFields: {
                classification: {
                    $cond: {
                        if: {
                            $in: ["$call_disposition", ["CALLBK", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "Xferh", "LB", "HO", "AFTHRS", "BN", "CALLBK", "DEC", "DNC", "DROP", "HU", "INXFER", "LB", "NHO", "NI", "NQ", "RQXFER", "SALE", "TEST", "TIMEOT", "WN", "XFER"]]
                        },
                        then: "HUMAN",
                        else: "MACHINE"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$LineType",
                Human: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "HUMAN"] },
                            1,
                            0
                        ]
                    }
                },
                Machine: {
                    $sum: {
                        $cond: [
                            { $eq: ["$classification", "MACHINE"] },
                            1,
                            0
                        ]
                    }
                },
                GrandTotal: { $sum: 1 }
            }
        },
        {
            $addFields: {
                "Human Answer%": {
                    $round: [
                        { $multiply: [{ $divide: ["$Human", "$GrandTotal"] }, 100] },
                        2
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                agentsData: { $push: "$$ROOT" },
                totalHuman: { $sum: "$Human" },
                totalMachine: { $sum: "$Machine" },
                totalGrandTotal: { $sum: "$GrandTotal" }
            }
        },
        {
            $addFields: {
                totals: {
                    _id: "Grand Total",
                    Human: "$totalHuman",
                    Machine: "$totalMachine",
                    GrandTotal: "$totalGrandTotal"
                }
            }
        },
        {
            $project: {
                finalResult: { $concatArrays: ["$agentsData", ["$totals"]] }
            }
        },
        {
            $unwind: "$finalResult"
        },
        {
            $replaceRoot: {
                newRoot: "$finalResult"
            }
        }
    ];

    try {
        const results = await Realtimelead.aggregate(pipeline);
       // console.log(results);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Agent Sale Report API
app.post('/api/AgentSaleReport', async (req, res) => {
    try {
       // console.log('Raw request body:', req.body); // Debugging raw body
        const { centerName, provider, fromDate, toDate, campaign } = req.body;

       // console.log('Received values:', { centerName, provider, fromDate, toDate, campaign });

        // Get dynamic campaign IDs based on input filters
        const campaignIds = getCampaignIds(centerName, provider, campaign);

        if (campaignIds.length === 0) {
            return res.status(400).json({ error: 'Invalid selection for campaign filtering' });
        }

        // Match conditions based on user input
        const matchConditions = {
            centerName: centerName,
            provider: provider,
            reportDate: {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            },
            campaign: { $in: campaignIds }
        };

         // Log the final match condition
        // console.log('Final match condition:', JSON.stringify(matchConditions, null, 2));

        // Aggregation pipeline
        const pipeline = [
            { $match: matchConditions },
            {
                $group: {
                    _id: {
                        full_name: "$full_name",
                        phone: "$phone"
                    },
                    records: {
                        $push: "$$ROOT"
                    }
                }
            },
            {
                $addFields: {
                    records: {
                        $sortArray: {
                            input: "$records",
                            sortBy: { duration: -1 }
                        }
                    }
                }
            },
            {
                $set: {
                    paid: { $arrayElemAt: ["$records", 0] }
                }
            },
            {
                $set: {
                    paid: {
                        $cond: {
                            if: { $gte: ["$paid.duration", 100] },
                            then: 1,
                            else: "$$REMOVE"
                        }
                    }
                }
            },
            {
                $addFields: {
                    transfer: { $size: "$records" }
                }
            },
            {
                $addFields: {
                    agent: "$_id.full_name"
                }
            },
            {
                $group: {
                    _id: "$agent",
                    totalAttempts: { $sum: "$transfer" },
                    totalPaid: { $sum: "$paid" }
                }
            },
            {
                $project: {
                    agent: "$_id",
                    totalAttempts: 1,
                    totalPaid: 1,
                    _id: 0
                }
            }
        ];

        const results = await ThreeWayReport.aggregate(pipeline);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define the schema for the Realtimeleads collection for postclient number details
const realtimeleadSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    email: String,
    phone: Number,
    postToClient: { type: Boolean, default: false } // Add postToClient field
});

// Create the model
const Realtimeleadd = mongoose.model('realtimeleads', realtimeleadSchema);

//search details to posttoclient before post
async function findClientDetailsByPhone(phone) {
   // console.log("Phone in findClient function: ", phone, "Type of phone:", typeof phone);
    try {

        const numericPhone = parseInt(phone, 10);  // Convert phone string to number
        if (isNaN(numericPhone)) {
            console.error("Invalid phone number, cannot convert to number");
            return null;
        }

        const pipeline = [
            { $match: { phone: numericPhone  } },  // Ensuring the phone is treated as a string
            { $project: {
                _id: 0,
                firstName: '$fname',
                lastName: '$lname',
                address: 1,
                city: 1,
                state: 1,
                postalCode: '$zip',
                email: 1,
                phone: 1
            }}
        ];
       // console.log('Pipeline: ', JSON.stringify(pipeline));  // Use JSON.stringify to see the full structure in console
        // Execute the aggregation pipeline on the correct model
        const results = await Realtimeleadd.aggregate(pipeline);

        // Return result if it exists
        return results;

    } catch (error) {
        console.error("Error in findClientDetailsByPhone: ", error);
        return null; // Return null or handle the error as needed
    }
}


// search detail of phone number from realtimeleads for Carlos
app.get('/search-by-phone', async (req, res) => {
    const { phone } = req.query;
    try {
        // Assuming you have a function to query your database
        const clientDetails = await findClientDetailsByPhone(phone);
        if (clientDetails && clientDetails.length > 0) {
            // Send only the first result to the frontend
            res.json({ success: true, details: clientDetails[0] });
        } else {
            res.status(404).json({ success: false, message: 'No details found' });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


//POST to CLIENT method, leads posting for Retell RealTime Leads by Carlos
app.post('/post-to-client', async (req, res) => {
    try {
        const { firstName, lastName, address, city, state, postalCode, phone, email } = req.body;

        if (!firstName || !lastName || !address || !city || !state || !postalCode || !phone || !email) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
       // console.log(firstName, lastName, phone, email);

       const numericPhone = parseInt(phone, 10);  // Convert phone string to number
        if (isNaN(numericPhone)) {
            console.error("Invalid phone number, cannot convert to number");
            return null;
        }

       // console.log("Nubmer format check: ", numericPhone);

        // Construct API URL https://choicehomewarranty.com
        let url = `https://choicehomewarranty.com/host-post.php?NETWORKID=sclPT&AFID=blindxfer&FirstName=${encodeURIComponent(firstName)}&LastName=${encodeURIComponent(lastName)}&Address=${encodeURIComponent(address)}&City=${encodeURIComponent(city)}&State=${encodeURIComponent(state)}&PostalCode=${encodeURIComponent(postalCode)}&Phone=${encodeURIComponent(phone)}&Email=${encodeURIComponent(email)}&IPAddress=208.109.184.203&_OwnHome=Yes&_optin=Yes&Team=b`;

        // Send request to client API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
  

        const responseData = await response.text(); // Get API response as text
        console.log("Response from client API while posting: ",responseData );

        // Check if response is successful (200)
        if (response.ok) {
            // Update postToClient field in the Realtimeleads collection
            const lead = await Realtimeleadd.findOneAndUpdate(
                { phone: numericPhone }, // Find the lead by phone
                { postToClient: true }, // Set postToClient to true
                { new: true } // Return the updated document
            );

            if (lead) {
                console.log(`Successfully updated postToClient to true for phone: ${phone}`);
            } else {
                console.error('Lead not found in the database');
            }
        } else {
            console.error('Failed to post data to client');
        }

        return res.status(200).json({ success: true, message: 'Data posted successfully', data: responseData });

    } catch (error) {
        console.error('Error posting to client:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

//         return res.status(200).json({ success: true, message: 'Data posted successfully', data: responseData });

//     } catch (error) {
//         console.error('Error posting to client:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// });


// clientReport
app.post('/api/clientReport', async (req, res) => {
    try {
        const { centerName, provider, Month, BiweeklyDate } = req.body;
      //  console.log("Received from frontend:", { centerName, provider, Month, BiweeklyDate });


        const matchConditions = {};
        
       // Handle `centerName`
       if (centerName) {
        matchConditions['Center'] = Array.isArray(centerName) ? { $in: centerName } : centerName;
    }

    // Handle `provider`
    if (provider) {
        matchConditions['campaign2'] = Array.isArray(provider) ? { $in: provider } : provider;
    }

    // Handle `Month`
    if (Month) {
        matchConditions['Month'] = Array.isArray(Month) ? { $in: Month } : Month;
    }

    // Handle `BiweeklyDate`
    if (BiweeklyDate) {
        matchConditions['Date'] = Array.isArray(BiweeklyDate) ? { $in: BiweeklyDate } : BiweeklyDate;
    }

    // Debugging: Log the final match conditions
   // console.log("Final match conditions:", JSON.stringify(matchConditions, null, 2));

    // **MongoDB Aggregation Query**
    const aggregationPipeline = [
        { $match: matchConditions },
        {
            $project: {
                phone: 1,
                status: 1,
                Date: 1,
                Month: 1,
                Outbound: 1,
                Source: 1,
                Center: 1,
                Duration: 1,
                campaign2: 1,
                "Transfer Date": 1,
                "SouceBackup/ListId": 1
            }
        }
    ];

        const results = await ClientReport.aggregate(aggregationPipeline);
        // console.log("Aggregated results:", results);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error running aggregation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint to add a new VoIP cost
app.post('/api/voipcosts', async (req, res) => {
    const { date, totalCost, provider, center } = req.body;

    try {
        // Create a new VoIP cost entry
        const newVoipCost = new VoipCost({
            date,
            totalCost,
            provider,
            center
        });
        await newVoipCost.save();
        res.status(201).json(newVoipCost);
    } catch (error) {
        console.error('Error saving VoIP cost:', error);
        res.status(500).json({ message: 'Error saving VoIP cost', error });
    }
});


// Endpoint to get VoIP costs Data complete(as per filter)
app.post('/api/voipcosts/filters', async (req, res) => {
    const { fromDate, toDate, center, dialer } = req.body;

    try {
        
        const pipeline = [
            {
                $match: {
                    date: {
                        $gte: new Date(fromDate),
                        $lt: new Date(toDate)
                    },
                    center: center || { $exists: true },
                    provider: dialer || { $exists: true }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    center: 1,
                    provider: 1,
                    totalCost: 1
                }
            }
        ];

        // Execute aggregation
        const filteredData = await VoipCost.aggregate(pipeline);
        res.status(200).json(filteredData);
    } catch (error) {
        console.error('Error fetching filtered VoIP costs:', error);
        res.status(500).json({ message: 'Error fetching filtered VoIP costs', error });
    }
});


// Endpoint to get all VoIP costs
// app.get('/api/voipcosts', async (req, res) => {
//     try {
//         const voipCosts = await VoipCost.find();
//         res.status(200).json(voipCosts);
//     } catch (error) {
//         console.error('Error fetching VoIP costs:', error);
//         res.status(500).json({ message: 'Error fetching VoIP costs', error });
//     }
// });



// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // console.log("Username:  ", username);
    // console.log("Pass:  ", password);
    try {
        const user = await User.findOne({ username });

        if (user && user.password === password) {
            res.json({ success: true, role: user.role, center: user.center });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Error during login: ", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout endpoint
// app.post('/api/logout', (req, res) => {
//     req.session.destroy(err => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Failed to log out' });
//         }
//         res.json({ success: true });
//     });
// });

// Runtime Performance endpoint
app.post('/api/runtimeperformance', async (req, res) => {
    const { centerName, provider, fromDate, toDate } = req.body;

    // console.log('Received Runtime filters:', { fromDate, toDate, centerName, provider });

    //centerName match condition
    let centerNameMatch;
    if (centerName === "Both") {
        centerNameMatch = { $in: ["Shark", "Fortune"] };
    } else {
        centerNameMatch = centerName;
    }

    //provider match condition
    let providerMatch;
    if (provider === "Both") {
        providerMatch = { $in: ["telcast", "phdialer"] };
    } else {
        providerMatch = provider;
    }


    try {
        const aggregationPipeline = [
            {
                $match: {
                    centerName: centerNameMatch,
                    provider: providerMatch,
                    dialedAt: {
                        $gte: new Date(fromDate),
                        $lt: new Date(toDate)
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    dialedAt: 1,
                    dataset: 1,
                    listId: 1,
                    file: 1,
                    totalNumberDial: 1,
                    humanAnswerCount: 1,
                    HAPercent: 1,
                    SaleCount: 1,
                    totalCountsOfFile: 1,
                    centerName: 1,
                    provider: 1
                }
            }
        ];

        const results = await RuntimeReport.aggregate(aggregationPipeline);
        res.json(results);
    } catch (error) {
        console.error("Error fetching runtime performance data: ", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Threeway Report endpoint
app.post('/api/threewayreports', async (req, res) => {
    const { centerName, provider, fromDate, toDate } = req.body;

    // console.log('Received threeway filters:', { fromDate, toDate, centerName, provider });

    //centerName match condition
    let centerNameMatch;
    if (centerName === "Both") {
        centerNameMatch = { $in: ["Shark", "Fortune"] };
    } else {
        centerNameMatch = centerName;
    }

    //provider match condition
    let providerMatch;
    if (provider === "Both") {
        providerMatch = { $in: ["telcast", "phdialer"] };
    } else {
        providerMatch = provider;
    }

    try {
        const aggregationPipeline = [
            {
                $match: {
                    centerName: centerNameMatch,
                    provider: providerMatch,
                    reportDate: {
                        $gte: new Date(fromDate),
                        $lte: new Date(toDate)
                    }
                }
            },
            {
                $sort: {
                    phone: 1,
                    duration: -1
                }
            },
            {
                $group: {
                    _id: "$phone",
                    fname: { $first: "$fname" },
                    lname: { $first: "$lname" },
                    state: { $first: "$state" },
                    zip: { $first: "$zip" },
                    phone: { $first: "$phone" },
                    duration: { $first: "$duration" },
                    full_name: { $first: "$full_name" },
                    agent: { $first: "$agent" },
                    transfer_time: { $first: "$transfer_time" },
                    centerName: { $first: "$centerName" },
                    provider: { $first: "$provider" }
                }
            },
            {
                $project: {
                    fname: 1,
                    lname: 1,
                    state: 1,
                    zip: 1,
                    phone: 1,
                    duration: 1,
                    full_name: 1,
                    agent: 1,
                    transfer_time: 1,
                    centerName: 1,
                    provider: 1
                }
            }
        ];

        const results = await ThreeWayReport.aggregate(aggregationPipeline);
        res.json(results);
    } catch (error) {
        console.error("Error fetching Threeway data: ", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


//AGENT PERFORMANCE
app.post('/api/agentPerformance', async (req, res) => {
    const { fromDate, toDate,  center, dialer, campaign } = req.body;

    const getCampaignIds = () => {
        if (center === 'Shark') {
            if (dialer === 'telcast') {
                if (campaign === 'Outbound') {
                    return ["SH_HWG", "SH_HWG2"];
                } else if (campaign === 'Inbound') {
                    return ["SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "Inbound_AiCallbacks"];
                } else if (campaign === 'Both') {
                    return ["SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "Inbound_AiCallbacks"];
                }
            } else if (dialer === 'phdialer') {
                if (campaign === 'Outbound') {
                    return ["HW", "HW_2"];
                } else if (campaign === 'Inbound') {
                    return ["CallerID", "INBOUNDH", "HWXFER"];
                } else if (campaign === 'Both') {
                    return ["HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER"];
                }
            } else if (dialer === 'Both') {
                if (campaign === 'Outbound') {
                    return ["SH_HWG", "SH_HWG2", "HW", "HW_2"];
                } else if (campaign === 'Inbound') {
                    return ["SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "CallerID", "INBOUNDH", "HWXFER", "Inbound_AiCallbacks"];
                } else if (campaign === 'Both') {
                    return ["SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER", "Inbound_AiCallbacks"];
                }
            }
        } else if (center === 'Fortune') {
            if (dialer === 'telcast') {
                if (campaign === 'Outbound') {
                    return ["FT_HW", "FT_JARED"];
                } else if (campaign === 'Inbound') {
                    return ["FT_Inbound", "FT_InboundCB2", "FT_InboundCB"];
                } else if (campaign === 'Both') {
                    return ["FT_HW", "FT_JARED", "FT_Inbound", "FT_InboundCB2", "FT_InboundCB"];
                }
            }
        } else if (center === 'Leadsinteractive') {
            if (dialer === 'ccs') {
                if (campaign === 'Outbound') {
                    return ["HOME", "HOME_1"];
                }else if (campaign === 'Both') {
                    return ["HOME", "HOME_1", "CallerID"];
                }
            }
        }
    };
    
    
    
    const campaignIds = getCampaignIds();
    // console.log('Received Filters:', { fromDate, toDate, campaignIds, center, dialer });

    // Define variables for dynamic center and provider (dialer)
    let centerNameFilter;
    let dialerFilter;

  // Set centerNameFilter based on center input
if (center === 'Shark') {
    centerNameFilter = "Shark";
} else if (center === 'Fortune') {
    centerNameFilter = "Fortune";
} else if (center === 'Leadsinteractive') {
    centerNameFilter = "Leadsinteractive";
} else if (center === 'Both') {
    centerNameFilter = ["Shark", "Fortune"];
}


    // Set dialerFilter based on dialer input
if (dialer === 'telcast') {
    dialerFilter = "telcast";
} else if (dialer === 'phdialer') {
    dialerFilter = "phdialer";
} else if (dialer === 'ccs') {
    dialerFilter = "ccs";
} else if (dialer === 'Both') {
    dialerFilter = ["telcast", "phdialer"];
}

    // Debugging - console logs
   // console.log('Center Name Filter:', centerNameFilter);
   // console.log('Dialer Filter:', dialerFilter);


  // Create Date objects from received date strings
  const fromDateObj = new Date(fromDate);  // Start of the day
  const toDateObj = new Date(toDate);      // End of the day

    const matchCondition = {
        dialedAt: {
            $gte: fromDateObj,
            $lt: toDateObj
        }
    };

    if (campaignIds.length > 0) {
        matchCondition.campaignId = { $in: campaignIds };
    }

    if (center) {
        if (center === 'Both') {
            matchCondition.centerName = { $in: ["Shark", "Fortune"] };
        } else {
            matchCondition.centerName = center;
        }
    }

    if (dialer) {
        if (dialer === 'Both') {
            matchCondition.provider = { $in: ["telcast", "phdialer"] };
        } else if (dialer === 'telcast') {
            matchCondition.provider = { $in: ["telcast"] };
        } else if (dialer === 'phdialer') {
            matchCondition.provider = { $in: ["phdialer"] };
        }else if (dialer === 'ccs') {
            matchCondition.provider = { $in: ["ccs"] };
        }
    }

    // Debug
    //'Match Condition:', matchCondition);

    try {
        const aggregationPipeline = [
            { $match: matchCondition },
               // Step 2: Classify statuses as HUMAN or MACHINE
        {
            $addFields: {
                classification: {
                    $cond: {
                        if: {
                            $in: [
                                "$status",
                                [
                                    "CALLBK", "CB", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER",
                                    "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP",
                                    "SC", "SOD", "Xferh", "LB", "HO", "AFTHRS", "BN", "DROP", "INXFER", "LB", 
                                    "TEST", "TIMEOT"
                                ]
                            ]
                        },
                        then: "HUMAN",
                        else: "MACHINE"
                    }
                }
            }
        },
        // Step 3: Group by agentName and calculate total duration
        {
            $group: {
                _id: "$agentName",
                Human: {
                    $sum: { $cond: [{ $eq: ["$classification", "HUMAN"] }, 1, 0] }
                },
                Machine: {
                    $sum: { $cond: [{ $eq: ["$classification", "MACHINE"] }, 1, 0] }
                },
                GrandTotal: { $sum: 1 },
                totalDurationSeconds: { $sum: "$duration" }
            }
        },
        // Step 4: Convert total duration to minutes
        {
            $addFields: {
                totalDurationMinutes: { $round: [{ $divide: ["$totalDurationSeconds", 60] }, 2] }
            }
        },
        // Step 5: Lookup total attempts and total paid from threewayreports
        {
            $lookup: {
                from: "threewayreports",
                let: { agentName: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$full_name", "$$agentName"] },
                                    { $gte: ["$reportDate", fromDateObj] },
                                    { $lt: ["$reportDate", toDateObj] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$full_name",
                            totalAttempts: { $sum: 1 },
                            totalPaid: {
                                $sum: { $cond: [{ $gte: ["$duration", 100] }, 1, 0] }
                            }
                        }
                    }
                ],
                as: "attemptsData"
            }
        },
        // Step 6: Add Total Attempts, Total Paid, and calculations
        {
            $addFields: {
                TotalAttempts: { $arrayElemAt: ["$attemptsData.totalAttempts", 0] },
                TotalPaid: { $arrayElemAt: ["$attemptsData.totalPaid", 0] },
                "Total Calls per Attempts": {
                    $cond: {
                        if: { $gt: [{ $arrayElemAt: ["$attemptsData.totalAttempts", 0] }, 0] },
                        then: { $round: [{ $divide: ["$Human", { $arrayElemAt: ["$attemptsData.totalAttempts", 0] }] }, 2] },
                        else: 0
                    }
                },
                "No of Calls Per Paid": {
                    $cond: {
                        if: { $gt: [{ $arrayElemAt: ["$attemptsData.totalPaid", 0] }, 0] },
                        then: { $round: [{ $divide: ["$Human", { $arrayElemAt: ["$attemptsData.totalPaid", 0] }] }, 2] },
                        else: 0
                    }
                }
            }
        },
        // Step 7: Sort results by GrandTotal
        { $sort: { GrandTotal: -1 } },
        // Step 8: Group data and calculate human answer percentage
        {
            $group: {
                _id: null,
                totalHumanAnswers: { $sum: "$Human" },
                agentsData: { $push: "$$ROOT" }
            }
        },
        { $unwind: "$agentsData" },
        {
            $addFields: {
                "agentsData.HumanAnswerPercentageOutofTotalHA": {
                    $round: [{ $multiply: [{ $divide: ["$agentsData.Human", "$totalHumanAnswers"] }, 100] }, 2]
                },
                "agentsData.totalHumanAnswers": "$totalHumanAnswers"
            }
        },
        { $replaceRoot: { newRoot: "$agentsData" } },
        // Step 9: Lookup and allocate cost from voipcosts
        {
            $lookup: {
                from: "voipcosts",
                let: { center: centerNameFilter, provider: dialerFilter, startDate: fromDateObj, endDate: toDateObj },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$center", "$$center"] },
                                    { $eq: ["$provider", "$$provider"] },
                                    { $gte: ["$date", "$$startDate"] },
                                    { $lt: ["$date", "$$endDate"] }
                                    // { $in: ["$center", Array.isArray(centerNameFilter) ? centerNameFilter : [centerNameFilter]] },
                                    //     { $in: ["$provider", Array.isArray(dialerFilter) ? dialerFilter : [dialerFilter]] },
                                    //     { $gte: ["$date", "$$startDate"] },
                                    //     { $lt: ["$date", "$$endDate"] }
                                ]
                            }
                        }
                    },
                    { $group: { _id: null, totalCost: { $sum: "$totalCost" } } }
                ],
                as: "voipCostData"
            }
        },
        {
            $addFields: {
                totalVoipCost: { $arrayElemAt: ["$voipCostData.totalCost", 0] },
                allocatedCost: {
                    $round: [{ $multiply: ["$HumanAnswerPercentageOutofTotalHA", { $divide: ["$totalVoipCost", 100] }] }, 2]
                }
            }
        },
        {
            $addFields: {
                allocatedCost: {
                    $round: [{ $multiply: ["$HumanAnswerPercentageOutofTotalHA", { $divide: ["$totalVoipCost", 100] }] }, 2]
                }
            }
        },
        // Step 10: Add final Human Answer % for each agent
        {
            $addFields: {
                "Human Answer%": { $round: [{ $multiply: [{ $divide: ["$Human", "$GrandTotal"] }, 100] }, 2] }
            }
        }
    ];

        const data = await Report.aggregate(aggregationPipeline);
        //console.log(data)
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});


// FILE PERFORMANCE
app.post('/api/filePerformance', async (req, res) => {
    let { fromDate, toDate, center, dialer, campaign, dataset, listId, fileNumber } = req.body;

   // console.log('Received input(fileperformance):  ', req.body);
    const fromDateObj = new Date(fromDate).toISOString().split('T')[0];
    const toDateObj = new Date(toDate).toISOString().split('T')[0];

    dataset = parseInt(dataset, 10);
    fileNumber = parseInt(fileNumber, 10); 

   let campaignValues = [];
   let providerValues = [];

   if(dialer==='telcast') {
    providerValues = ["telcast"];
   }else if (dialer === 'phdialer'){
    providerValues = ["phdialer"]
   }else{
    providerValues= ["phdialer", "telcast"]
   }

   if (center === 'Shark' && dialer === 'telcast') {
       if (campaign === 'Outbound') {
           campaignValues = ["SH_HWG", "SH_HWG2"];
       } else if (campaign === 'Inbound') {
           campaignValues = ["SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "Inbound_AiCallbacks"];
       } else if (campaign === 'Both') {
           campaignValues = ["SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "Inbound_AiCallbacks"];
       }
   } else if (center === 'Shark' && dialer === 'phdialer') {
       if (campaign === 'Outbound') {
           campaignValues = ["HW", "HW_2"];
       } else if (campaign === 'Inbound') {
           campaignValues = ["CallerID", "INBOUNDH", "HWXFER"];
       } else if (campaign === 'Both') {
           campaignValues = ["HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER"];
       }
   }else if (center === 'Shark' && dialer === 'Both') {
    if (campaign === 'Outbound') {
        campaignValues = ["HW", "HW_2", "SH_HWG", "SH_HWG2"];
    } else if (campaign === 'Inbound') {
        campaignValues = ["CallerID", "INBOUNDH", "HWXFER", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
    } else if (campaign === 'Both') {
        campaignValues = ["HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER", "SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
    }
}  else if (center === 'Fortune' && dialer === 'telcast') {
       if (campaign === 'Outbound') {
           campaignValues = ["FT_HW", "FT_JARED"];
       } else if (campaign === 'Inbound') {
           campaignValues = ["FT_Inbound", "FT_InboundCB2", "FT_InboundCB"];
       } else if (campaign === 'Both') {
           campaignValues = ["FT_HW", "FT_JARED", "FT_Inbound", "FT_InboundCB2", "FT_InboundCB"];
       }
   }

   const matchCondition = {
       dialedAt: {
           $gte: new Date(fromDateObj),
           $lt: new Date(toDateObj)
       },
       centerName: center,
       provider: { $in: providerValues },
       campaignId: { $in: campaignValues }
   };

    // Add listId filter only if it is provided
    if (listId && listId.length) {
        matchCondition.Source_listId = { $in: Array.isArray(listId) ? listId : [listId] };
    }

   // Add dataset filter only if it is valid
if (dataset !== null && dataset !== undefined && !isNaN(dataset)) {
    matchCondition.dataset = { $in: Array.isArray(dataset) ? dataset : [dataset] };
}

// Add fileNumber filter only if it is valid
// if (fileNumber !== null && fileNumber !== undefined && !isNaN(fileNumber)) {
//     matchCondition.file = { $in: Array.isArray(fileNumber) ? fileNumber : [fileNumber] };
// }

   // console.log(matchCondition);

    try {
        const aggregationPipeline = [
            {
                $lookup: {
                    from: "contacts",
                    localField: "phone",
                    foreignField: "phone",
                    as: "contactDetails"
                }
            },
            {
                $unwind: {
                    path: "$contactDetails"
                }
            },
            {
                $addFields: {
                    dataset: "$contactDetails.dataset",
                    Source_listId: "$contactDetails.listId",
                    file: "$contactDetails.file"
                }
            },
            {
                $match: matchCondition
            },
            {
                $group: {
                    _id: "$phone",
                    humanCount: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        "$status",
                                        [
                                            "CALLBK", "CB", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER",
                                            "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP",
                                            "SC", "SOD", "Xferh", "LB", "HO", "AFTHRS", "BN", "DROP", "INXFER", "LB", 
                                            "TEST", "TIMEOT"
                                        ]
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    nonHumanCount: {
                        $sum: {
                            $cond: [
                                {
                                    $not: {
                                        $in: [
                                            "$status",
                                            [
                                                "CALLBK", "CB", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER",
                                                "B", "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP",
                                                "SC", "SOD", "Xferh", "LB", "HO", "AFTHRS", "BN", "DROP", "INXFER", "LB", 
                                                "TEST", "TIMEOT"
                                            ]
                                        ]
                                    }
                                },
                                1,
                                0
                            ]
                        }
                    },
                    totalCount: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: "contacts",
                    localField: "_id",
                    foreignField: "phone",
                    as: "contactDetails"
                }
            },
            {
                $unwind: "$contactDetails"
            },
            {
                $group: {
                    _id: {
                        dataset: "$contactDetails.dataset",
                        listId: "$contactDetails.listId",
                        file: "$contactDetails.file"
                    },
                    phoneCount: {
                        $sum: "$totalCount"
                    },
                    humanCount: {
                        $sum: "$humanCount"
                    },
                    nonHumanCount: {
                        $sum: "$nonHumanCount"
                    },
                    phones: {
                        $addToSet: "$_id"
                    }
                }
            },
            {
                $lookup: {
                    from: "threewayreports",
                    let: {
                        phones: "$phones",
                        startDate: new Date(fromDateObj),
                        endDate: new Date(toDateObj)
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ["$phone", "$$phones"] },
                                        { $gte: ["$reportDate", "$$startDate"] },
                                        { $lt: ["$reportDate", "$$endDate"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "threewayDetails"
                }
            },
            {
                $project: {
                    dataset: "$_id.dataset",
                    listId: "$_id.listId",
                    file: "$_id.file",
                    phoneCount: 1,
                    humanCount: 1,
                    nonHumanCount: 1,
                    attemptsCount: {
                        $size: "$threewayDetails"
                    },
                    paidCount: {
                        $size: {
                            $filter: {
                                input: "$threewayDetails",
                                as: "record",
                                cond: {
                                    $gte: ["$$record.duration", 100]
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    HA: {
                        $cond: {
                            if: { $gt: ["$phoneCount", 0] },
                            then: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ["$humanCount", "$phoneCount"] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            else: 0
                        }
                    },
                    NonHA: {
                        $cond: {
                            if: { $gt: ["$phoneCount", 0] },
                            then: {
                                $round: [
                                    {
                                        $multiply: [
                                            { $divide: ["$nonHumanCount", "$phoneCount"] },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $sort: { phoneCount: -1 }
            },
            {
                $project: {
                    _id: 0,
                    listId: 1,
                    file: 1,
                    dataset: 1,
                    phoneCount: 1,
                    humanCount: 1,
                    nonHumanCount: 1,
                    attemptsCount: 1,
                    paidCount: 1,
                    HA: 1,
                    NonHA: 1
                }
            }
        ];
       // console.log("Aggregation:  ", aggregationPipeline);
        const data = await Report.aggregate(aggregationPipeline);
       // console.log("data:  ", data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});         
         

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

