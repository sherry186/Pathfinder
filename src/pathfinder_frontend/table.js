const type=["營隊", "課程", "講座與工作坊", "競賽"];

/*const total=[
    {
        title: "資訊學群",
        data: [{index:1,name:"資訊工程"},{index:2,name:"數據統計"}]
    },
    {
        title: "工程學群",
        data: [
            {index:3,name:"電機工程"},{index:4,name:"光電工程"},{index:5,name:"電子工程"},{index:6,name:"通訊工程"},
            {index:7,name:"工程科學"},{index:8,name:"機械工程"},{index:9,name:"航空工程"},{index:10,name:"土木工程"},
            {index:11,name:"水利工程"},{index:12,name:"化學工程"},{index:13,name:"材料工程"},{index:14,name:"生醫工程"},
            {index:15,name:"科技教育"}
        ]
    },
    {
        title: "數理化學群",
        data: [
            {index:16,name:"數學"},{index:17,name:"化學"},{index:18,name:"物理"},{index:19,name:"自然科學"},
            {index:20,name:"數學教育"}
        ]
    },
    {
        title: "醫藥衛生學群",
        data: [
            {index:21,name:"醫學"},{index:22,name:"公共衛生"},{index:23,name:"牙醫"},{index:24,name:"物理治療"},
            {index:25,name:"職能治療"},{index:26,name:"護理"},{index:27,name:"醫學檢驗"},{index:28,name:"影像放射"},
            {index:29,name:"藥學"},{index:30,name:"食品營養"},{index:31,name:"呼吸治療"},{index:32,name:"健康照護"},
            {index:33,name:"化妝品"},{index:34,name:"職業安全"},{index:35,name:"運動保健"},{index:36,name:"視光"},
            {index:37,name:"語療聽力"}
        ]
    },
    {
        title: "生命科學學群",
        data: [
            {index:38,name:"生物資訊"},{index:39,name:"生化"},{index:40,name:"生命科學"},{index:41,name:"生物科技"}
        ]
    },
    {
        title: "生物資源學群",
        data: [
            {index:42,name:"獸醫"},{index:43,name:"植物保護"},{index:44,name:"生態"},{index:45,name:"農藝"},
            {index:46,name:"動物科學"},{index:47,name:"園藝"},{index:48,name:"森林"},{index:49,name:"海洋資源"},
            {index:50,name:"食品生技"}
        ]
    },
    {
        title: "地球環境學群",
        data: [
            {index:51,name:"環境工程"},{index:52,name:"地球科學"},{index:53,name:"地理"},{index:54,name:"海洋科學"},
            {index:55,name:"大氣科學"},{index:56,name:"防災"}
        ]
    },
    {
        title: "建築設計學群",
        data: [
            {index:57,name:"媒體設計"},{index:58,name:"建築"},{index:59,name:"都市計畫"},{index:60,name:"空間設計"},
            {index:61,name:"工業設計"},{index:62,name:"工藝"},{index:63,name:"商業設計"},{index:64,name:"服裝設計"},
            {index:65,name:"藝術設計"}
        ]
    },
    {
        title: "藝術學群",
        data: [
            {index:66,name:"美術"},{index:67,name:"音樂"},{index:68,name:"表演藝術"}
        ]
    },
    {
        title: "社會心理學群",
        data: [
            {index:69,name:"心理"},{index:70,name:"社會學"},{index:71,name:"社會工作"},{index:72,name:"人類民族"},
            {index:73,name:"兒童家庭"},{index:74,name:"宗教"},{index:75,name:"輔導諮商"},{index:76,name:"犯罪防治"}
        ]
    },
    {
        title: "大眾傳播學群",
        data: [
            {index:77,name:"資訊傳播"},{index:78,name:"大眾傳播"},{index:79,name:"廣電電影"},{index:80,name:"新聞"},
            {index:81,name:"廣告公關"}
        ]
    },
    {
        title: "外語學群",
        data: [
            {index:82,name:"英語文"},{index:83,name:"歐語文"},{index:84,name:"日語文"},{index:85,name:"東方語文"},
            {index:86,name:"英語教育"}
        ]
    },
    {
        title: "文史哲學群",
        data: [
            {index:87,name:"圖書資訊"},{index:88,name:"文化產業"},{index:89,name:"中國語文"},{index:90,name:"歷史"},
            {index:91,name:"哲學"},{index:92,name:"台灣語文"},{index:93,name:"史地"},{index:94,name:"華語文教育"}
        ]
    },
    {
        title: "教育學群",
        data: [
            {index:95,name:"數位學習"},{index:96,name:"教育"},{index:97,name:"特殊教育"},{index:98,name:"幼兒教育"},
            {index:99,name:"成人教育"},{index:100,name:"社科教育"}
        ]
    },
    {
        title: "法政學群",
        data: [
            {index:101,name:"法律"},{index:102,name:"財經法律"},{index:103,name:"政治"},{index:104,name:"行政管理"}
        ]
    },
    {
        title: "管理學群",
        data: [
            {index:105,name:"資訊管理"},{index:106,name:"電子商務"},{index:107,name:"科技管理"},{index:108,name:"醫務管理"},
            {index:109,name:"勞工關係"},{index:110,name:"企業管理"},{index:111,name:"行銷經營"},{index:112,name:"運輸物流"},
            {index:113,name:"土地資產"},{index:114,name:"觀光事業"},{index:115,name:"運動管理"},{index:116,name:"餐旅管理"},
            {index:117,name:"休閒管理"}
        ]
    },
    {
        title: "財經學群",
        data: [
            {index:118,name:"財金統計"},{index:119,name:"會計"},{index:120,name:"財務金融"},{index:121,name:"國際企業"},
            {index:122,name:"財稅"},{index:123,name:"保險"},{index:124,name:"經濟"}
        ]
    },
    {
        title: "遊憩運動學群",
        data: [
            {index:125,name:"體育"},{index:126,name:"舞蹈"}
        ]
    },
    {
        title: "學院不分系",
        data: [
            {index:127,name:"工程不分系"},{index:128,name:"藝術不分系"},{index:129,name:"電資不分系"},{index:130,name:"商管不分系"},
            {index:131,name:"理學不分系"}
        ]
    }
];*/

const intersted_major = [
    {index:87,name:"圖書資訊"},{index:125,name:"體育"},{index:120,name:"財務金融"},{index:101,name:"法律"},
    {index:69,name:"心理"},{index:51,name:"環境工程"},{index:59,name:"都市計畫"},{index:110,name:"企業管理"},
    {index:66,name:"美術"},{index:1,name:"資訊工程"},{index:21,name:"醫學"},{index:82,name:"英語文"},
    {index:77,name:"資訊傳播"},{index:105,name:"資訊管理"}
];

const interested_major_index = [87,125,120,101,69,51,59,110,66,1,21,82,77,105];

const total_department = [
    {index:1,name:"資訊學群"},{index:2,name:"工程學群"},{index:3,name:"數理化學群"},{index:4,name:"醫藥衛生學群"},
    {index:5,name:"生命科學學群"},{index:6,name:"生物資源學群"},{index:7,name:"地球環境學群"},{index:8,name:"建築設計學群"},
    {index:9,name:"藝術學群"},{index:10,name:"社會心理學群"},{index:11,name:"大眾傳播學群"},{index:12,name:"外語學群"},
    {index:13,name:"文史哲學群"},{index:14,name:"教育學群"},{index:15,name:"法政學群"},{index:16,name:"管理學群"},
    {index:17,name:"財經學群"},{index:18,name:"遊憩運動學群"},{index:19,name:"學院不分系"}
]

const total_major = [
    {index:1,name:"資訊工程"},{index:2,name:"數據統計"},{index:3,name:"電機工程"},{index:4,name:"光電工程"},
    {index:5,name:"電子工程"},{index:6,name:"通訊工程"},{index:7,name:"工程科學"},{index:8,name:"機械工程"},
    {index:9,name:"航空工程"},{index:10,name:"土木工程"},{index:11,name:"水利工程"},{index:12,name:"化學工程"},
    {index:13,name:"材料工程"},{index:14,name:"生醫工程"},{index:15,name:"科技教育"},{index:16,name:"數學"},
    {index:17,name:"化學"},{index:18,name:"物理"},{index:19,name:"自然科學"},{index:20,name:"數學教育"},
    {index:21,name:"醫學"},{index:22,name:"公共衛生"},{index:23,name:"牙醫"},{index:24,name:"物理治療"},
    {index:25,name:"職能治療"},{index:26,name:"護理"},{index:27,name:"醫學檢驗"},{index:28,name:"影像放射"},
    {index:29,name:"藥學"},{index:30,name:"食品營養"},{index:31,name:"呼吸治療"},{index:32,name:"健康照護"},
    {index:33,name:"化妝品"},{index:34,name:"職業安全"},{index:35,name:"運動保健"},{index:36,name:"視光"},
    {index:37,name:"語療聽力"},{index:38,name:"生物資訊"},{index:39,name:"生化"},{index:40,name:"生命科學"},
    {index:41,name:"生物科技"}, {index:42,name:"獸醫"},{index:43,name:"植物保護"},{index:44,name:"生態"},
    {index:45,name:"農藝"},{index:46,name:"動物科學"},{index:47,name:"園藝"},{index:48,name:"森林"},
    {index:49,name:"海洋資源"},{index:50,name:"食品生技"},{index:51,name:"環境工程"},{index:52,name:"地球科學"},
    {index:53,name:"地理"},{index:54,name:"海洋科學"},{index:55,name:"大氣科學"},{index:56,name:"防災"},
    {index:57,name:"媒體設計"},{index:58,name:"建築"},{index:59,name:"都市計畫"},{index:60,name:"空間設計"},
    {index:61,name:"工業設計"},{index:62,name:"工藝"},{index:63,name:"商業設計"},{index:64,name:"服裝設計"},
    {index:65,name:"藝術設計"},{index:66,name:"美術"},{index:67,name:"音樂"},{index:68,name:"表演藝術"},
    {index:69,name:"心理"},{index:70,name:"社會學"},{index:71,name:"社會工作"},{index:72,name:"人類民族"},
    {index:73,name:"兒童家庭"},{index:74,name:"宗教"},{index:75,name:"輔導諮商"},{index:76,name:"犯罪防治"},
    {index:77,name:"資訊傳播"},{index:78,name:"大眾傳播"},{index:79,name:"廣電電影"},{index:80,name:"新聞"},
    {index:81,name:"廣告公關"}, {index:82,name:"英語文"},{index:83,name:"歐語文"},{index:84,name:"日語文"},
    {index:85,name:"東方語文"},{index:86,name:"英語教育"},{index:87,name:"圖書資訊"},{index:88,name:"文化產業"},
    {index:89,name:"中國語文"},{index:90,name:"歷史"},{index:91,name:"哲學"},{index:92,name:"台灣語文"},
    {index:93,name:"史地"},{index:94,name:"華語文教育"},{index:95,name:"數位學習"},{index:96,name:"教育"},
    {index:97,name:"特殊教育"},{index:98,name:"幼兒教育"},{index:99,name:"成人教育"},{index:100,name:"社科教育"},
    {index:101,name:"法律"},{index:102,name:"財經法律"},{index:103,name:"政治"},{index:104,name:"行政管理"},
    {index:105,name:"資訊管理"},{index:106,name:"電子商務"},{index:107,name:"科技管理"},{index:108,name:"醫務管理"},
    {index:109,name:"勞工關係"},{index:110,name:"企業管理"},{index:111,name:"行銷經營"},{index:112,name:"運輸物流"},
    {index:113,name:"土地資產"},{index:114,name:"觀光事業"},{index:115,name:"運動管理"},{index:116,name:"餐旅管理"},
    {index:117,name:"休閒管理"},{index:118,name:"財金統計"},{index:119,name:"會計"},{index:120,name:"財務金融"},
    {index:121,name:"國際企業"},{index:122,name:"財稅"},{index:123,name:"保險"},{index:124,name:"經濟"},
    {index:125,name:"體育"},{index:126,name:"舞蹈"},{index:127,name:"工程不分系"},{index:128,name:"藝術不分系"},
    {index:129,name:"電資不分系"},{index:130,name:"商管不分系"},{index:131,name:"理學不分系"}
]

export { type, total_major, intersted_major, interested_major_index, total_department };