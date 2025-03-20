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
    duration: Number
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

// clientReport
app.post('/api/clientReport', async (req, res) => {
    try {
        const { centerName, provider, fromDate, toDate, Month, BiweeklyDate } = req.body;
        //console.log("Received from frontend:", { centerName, provider, fromDate, toDate, Month, BiweeklyDate });


        const matchConditions = {};
        
       // Handle centerName (single or multiple values)
       if (centerName) {
        if (Array.isArray(centerName)) {
            matchConditions['Center'] = { $in: centerName }; // For multiple center names
        } else {
            matchConditions['Center'] = centerName; // For a single center name
        }
    }
    
    // Handle provider (single or multiple values)
    if (provider) {
        if (Array.isArray(provider)) {
            matchConditions['campaign2'] = { $in: provider }; // For multiple providers
        } else {
            matchConditions['campaign2'] = provider; // For a single provider
        }
    }

    // Handle Transfer Date (fromDate and toDate must both be provided)
    if (fromDate && toDate) {
        matchConditions['Transfer Date'] = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate)
        };
    }

    // Handle Month (single or multiple values)
    if (Month) {
        if (Array.isArray(Month)) {
            matchConditions['Month'] = { $in: Month }; // For multiple months
        } else {
            matchConditions['Month'] = Month; // For a single month
        }
    }

    // Handle BiweeklyDate (single or multiple values)
    if (BiweeklyDate) {
        if (Array.isArray(BiweeklyDate)) {
            matchConditions['Date'] = { $in: BiweeklyDate }; // For multiple Biweekly dates
        } else {
            matchConditions['Date'] = BiweeklyDate; // For a single Biweekly date
        }
    }

        //match condition for debug
        //console.log("Final match conditions:", matchConditions);

        const pipeline = [
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: "contacts", 
                    localField: "phone",  
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
                        status: "$status",
                        dataset: "$contactDetails.dataset",
                        listId: "$contactDetails.listId",
                        centerName: "$contactDetails.centerName"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id.status",
                    dataset: "$_id.dataset",
                    listId: "$_id.listId",
                    centerName: "$_id.centerName",
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { status: 1, count: -1 }
            }
        ];
        const results = await ClientReport.aggregate(pipeline);
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

