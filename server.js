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

mongoose.set("debug", true);    

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    center: { type: String, required: true }
});

const User = mongoose.model('user', userSchema);

const runtimeSchema = new mongoose.Schema({
    dialedAt: Date,
    campaignId: String,
    centerName: String, 
    provider: String   
});

const RuntimeReport = mongoose.model('runtimelog', runtimeSchema);

const reportSchema = new mongoose.Schema({
    agentName: String,
    status: String,
    dialedAt: Date,
    campaignId: String,
    centerName: String, 
    provider: String   
});

const Report = mongoose.model('dialerdailyreport', reportSchema);

// Schema and Model for contacts
const contactSchema = new mongoose.Schema({
    phone: String,
    dataset: String,
    listId: String
});
const Contact = mongoose.model('contact', contactSchema);

// Schema and Model for threewayreports
const threeWaySchema = new mongoose.Schema({
    phone: String,
    reportDate: Date,
    duration: Number
});
const ThreeWayReport = mongoose.model('threewayreport', threeWaySchema);


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
        centerNameMatch = { $in: ["SHARK", "FORTUNE"] };
    } else {
        centerNameMatch = centerName;
    }

    //provider match condition
    let providerMatch;
    if (provider === "Both") {
        providerMatch = { $in: ["Telcast", "Phdialer"] };
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



//AGENT PERFORMANCE
app.post('/api/agentPerformance', async (req, res) => {
    const { fromDate, toDate,  center, dialer, campaign } = req.body;

    const getCampaignIds = () => {
        if (center === 'SHARK') {
            if (dialer === 'Telcast') {
                if (campaign === 'Outbound') {
                    return ["SH_HWG", "SH_HWG2"];
                } else if (campaign === 'Inbound') {
                    return ["SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
                } else if (campaign === 'Both') {
                    return ["SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
                }
            } else if (dialer === 'Phdialer') {
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
                    return ["SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "CallerID", "INBOUNDH", "HWXFER"];
                } else if (campaign === 'Both') {
                    return ["SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT", "HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER"];
                }
            }
        } else if (center === 'FORTUNE') {
            if (dialer === 'Telcast') {
                if (campaign === 'Outbound') {
                    return ["FT_HW", "FT_JARED"];
                } else if (campaign === 'Inbound') {
                    return ["FT_Inbound", "FT_InboundCB2", "FT_InboundCB"];
                } else if (campaign === 'Both') {
                    return ["FT_HW", "FT_JARED", "FT_Inbound", "FT_InboundCB2", "FT_InboundCB"];
                }
            }
        }
    };
    
    
    const campaignIds = getCampaignIds();
    // console.log('Received Filters:', { fromDate, toDate, campaignIds, center, dialer });

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
            matchCondition.centerName = { $in: ["SHARK", "FORTUNE"] };
        } else {
            matchCondition.centerName = center;
        }
    }

    if (dialer) {
        if (dialer === 'Both') {
            matchCondition.provider = { $in: ["Telcast", "Phdialer"] };
        } else if (dialer === 'Telcast') {
            matchCondition.provider = { $in: ["Telcast"] };
        } else if (dialer === 'Phdialer') {
            matchCondition.provider = { $in: ["Phdialer"] };
        }
    }

    // Debug
    console.log('Match Condition:', matchCondition);

    try {
        const aggregationPipeline = [
            { $match: matchCondition },
            {
                $addFields: {
                    classification: {
                        $cond: {
                            if: {
                                $in: ["$status", [
                                    "CALLBK", "CB", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B",
                                    "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "SC", "SOD",
                                    "Xferh", "LB", "HO", "AFTHRS","BN", "B","DROP", "DROP", "INXFER", "LB",
                                    "NHO", "WN", "XFER"
                                ]]
                            },
                            then: "HUMAN",
                            else: "MACHINE"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$agentName",
                    Human: { $sum: { $cond: [{ $eq: ["$classification", "HUMAN"] }, 1, 0] } },
                    Machine: { $sum: { $cond: [{ $eq: ["$classification", "MACHINE"] }, 1, 0] } },
                    GrandTotal: { $sum: 1 },
                    totalDurationSeconds: {
                      $sum: "$duration"
                    }
                }
            },
            {
                $addFields: {
                    totalDurationMinutes: {
                      $round: [
                        {
                          $divide: ["$totalDurationSeconds", 60]
                        },
                        2
                      ]
                    },
                    costPerAgent: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: ["$totalDurationSeconds", 60]
                            },
                            0.0055
                          ]
                        },
                        2
                      ]
                    }
                  }
            },
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
                    $sum: {
                        $cond: [
                            { $gte: ["$duration", 100] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ],
    as: "attemptsData"
}

            },
            {
                $addFields: {
                  
                        TotalAttempts: {
                          $arrayElemAt: [
                            "$attemptsData.totalAttempts",
                            0
                          ]
                        },
                        TotalPaid: {
                          $arrayElemAt: ["$attemptsData.totalPaid", 0]
                        },
                        "Total Calls per Attempts": {
                          $cond: {
                            if: {
                              $gt: [
                                {
                                  $arrayElemAt: [
                                    "$attemptsData.totalAttempts",
                                    0
                                  ]
                                },
                                0
                              ]
                            },
                            then: {
                              $round: [
                                {
                                  $divide: [
                                    "$Human",
                                    {
                                      $arrayElemAt: [
                                        "$attemptsData.totalAttempts",
                                        0
                                      ]
                                    }
                                  ]
                                },
                                2
                              ]
                            },
                            else: 0
                          }
                        },
                        "No of Calls Per Paid": {
                          $cond: {
                            if: {
                              $gt: [
                                {
                                  $arrayElemAt: [
                                    "$attemptsData.totalPaid",
                                    0
                                  ]
                                },
                                0
                              ]
                            },
                            then: {
                              $round: [
                                {
                                  $divide: [
                                    "$Human",
                                    {
                                      $arrayElemAt: [
                                        "$attemptsData.totalPaid",
                                        0
                                      ]
                                    }
                                  ]
                                },
                                2
                              ]
                            },
                            else: 0
                          }
                        },
                        costPerPaidLead: {
                          $cond: {
                            if: {
                              $gt: [
                                {
                                  $arrayElemAt: [
                                    "$attemptsData.totalPaid",
                                    0
                                  ]
                                },
                                0
                              ]
                            },
                            then: {
                              $round: [
                                {
                                  $divide: [
                                    "$costPerAgent",
                                    {
                                      $arrayElemAt: [
                                        "$attemptsData.totalPaid",
                                        0
                                      ]
                                    }
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
            { $sort: { GrandTotal: -1 } },
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
    const { fromDate, toDate, center, dialer, campaign } = req.body;

    // console.log('Received input(fileperformance):  ', req.body);
    const fromDateObj = new Date(fromDate).toISOString().split('T')[0];
    const toDateObj = new Date(toDate).toISOString().split('T')[0];

   let campaignValues = [];
   let providerValues = [];

   if(dialer==='Telcast') {
    providerValues = ["Telcast"];
   }else if (dialer === 'Phdialer'){
    providerValues = ["Phdialer"]
   }else{
    providerValues= ["Phdialer", "Telcast"]
   }

   if (center === 'SHARK' && dialer === 'Telcast') {
       if (campaign === 'Outbound') {
           campaignValues = ["SH_HWG", "SH_HWG2"];
       } else if (campaign === 'Inbound') {
           campaignValues = ["SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
       } else if (campaign === 'Both') {
           campaignValues = ["SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
       }
   } else if (center === 'SHARK' && dialer === 'Phdialer') {
       if (campaign === 'Outbound') {
           campaignValues = ["HW", "HW_2"];
       } else if (campaign === 'Inbound') {
           campaignValues = ["CallerID", "INBOUNDH", "HWXFER"];
       } else if (campaign === 'Both') {
           campaignValues = ["HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER"];
       }
   }else if (center === 'SHARK' && dialer === 'Both') {
    if (campaign === 'Outbound') {
        campaignValues = ["HW", "HW_2", "SH_HWG", "SH_HWG2"];
    } else if (campaign === 'Inbound') {
        campaignValues = ["CallerID", "INBOUNDH", "HWXFER", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
    } else if (campaign === 'Both') {
        campaignValues = ["HW", "HW_2", "CallerID", "INBOUNDH", "HWXFER", "SH_HWG", "SH_HWG2", "SH_INBOUND", "SH_Inbound_Callbacks2", "SH_Inbound_Callbacks", "AGENTDIRECT"];
    }
}  else if (center === 'FORTUNE' && dialer === 'Telcast') {
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

    try {
        const aggregationPipeline = [
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
                                            "CALLBK", "CB", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B",
                                            "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "SC", "SOD",
                                            "Xferh", "LB", "HO", "AFTHRS","BN", "B","DROP", "DROP", "INXFER", "LB",
                                            "NHO", "WN", "XFER"
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
                                                "CALLBK", "CB", "DEC", "DNC", "HU", "NHW", "NI", "NQ", "SALE", "WN", "XFER", "B",
                                                "CDrop", "Cs", "NH", "NHO", "NP", "CBHOLD", "INXFER", "PU", "PDROP", "SC", "SOD",
                                                "Xferh", "LB", "HO", "AFTHRS","BN", "B","DROP", "DROP", "INXFER", "LB",
                                                "NHO", "WN", "XFER"
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
                        listId: "$contactDetails.listId"
                      //  file: "$contactDetails.file"
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
                   // file: "$_id.file",
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
                  //  file: 1,
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

        const data = await Report.aggregate(aggregationPipeline);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});         
         

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

