(* ::Package:: *)

getExpectedParameters[fitParams_, params_, numberOfSimulations_]:=Module[{},
<|
    "r0"-> <|"value"-> fitParams["r0natural"], "name"->"Basic reproduction number", "description"-> "The basic reproduction number.", "type"->"fit","citations"->{}|>,
    "daysUntilNotInfectious"-><|"value"-> daysUntilNotInfectious0, "name"-> "Days until not infectious", "description"-> "The number of days it takes to lose infectiousness after starting on average.", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.03.24.20042606v1.full.pdf","https://www.nature.com/articles/s41586-020-2196-x_reference.pdf"}|>,
    "daysUntilHospitalized"-><|"value"-> daysUntilHospitalized0, "name"-> "Days until hospitalized", "description"-> "The number of days it takes to become hospitalized, if you are going to, after becoming infectious on average.", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/medrxiv/early/2020/01/28/2020.01.26.20018754.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.03.03.20029983v1.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.03.03.20028423v3.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "daysFromInfectedToInfectious"-><|"value"-> daysFromInfectedToInfectious0, "name"-> "Days from infected to infectious", "description"-> "The number of days it takes to become infectious after being infected on average", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.03.24.20042606v1.full.pdf", "https://annals.org/aim/fullarticle/2762808/incubation-period-coronavirus-disease-2019-covid-19-from-publicly-reported", "https://www.medrxiv.org/content/medrxiv/early/2020/01/28/2020.01.26.20018754.full.pdf"}|>,
    "daysToLeaveHospitalNonCritical"-><|"value"-> daysToLeaveHospitalNonCritical0, "name"-> "Days to leave the hospital in a non-critical case", "description"-> "The number of days it takes to leave the hospital if you are not a critical case", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.03.03.20029983v1", "https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "pPCRNH"-><|"value"-> params["pPCRNH"], "name"-> "Probability of getting a positive PCR test if you are not in the hospital", "description"-> "An age-adjusted probability that you get a positive PCR test if your disease is not serious enough to require hospitalization or critical care.", "type"->"literature"|>,
    "pPCRH"-><|"value"-> params["pPCRH"], "name"-> "Probability of getting a positive PCR test if you are in the hospital or ICU,", "description"-> "An age-adjusted probability that you get a positive PCR test in cases that require hospitalization or critical care", "type"->"literature",
      "citations"->{"https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "daysTogoToCriticalCare"-><|"value"-> daysTogoToCriticalCare0, "name"-> "Days to go to critical care after arriving in the hospital", "description"-> "The number of days it takes to go to critical care after arriving in the hospital in a serious case.", "type"->"literature",
      "citations"->{"https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30566-3/fulltext", "https://jamanetwork.com/journals/jama/fullarticle/2761044", "https://www.nejm.org/doi/pdf/10.1056/NEJMoa2004500?articleTools=true"}|>,
    "daysFromCriticalToRecoveredOrDeceased"-><|"value"-> daysFromCriticalToRecoveredOrDeceased0, "name"-> "Days from an ICU admission to recovery or fatality", "description"-> "The number of days it takes on average to resolve an ICU admission on average", "type"->"literature",
      "citations"->{"https://www.icnarc.org/DataServices/Attachments/Download/b5f59585-5870-ea11-9124-00505601089b", "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30566-3/fulltext", "https://www.nejm.org/doi/pdf/10.1056/NEJMoa2004500?articleTools=true", "https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf", "https://www.medrxiv.org/content/medrxiv/early/2020/01/28/2020.01.26.20018754.full.pdf", "https://www.medrxiv.org/content/10.1101/2020.04.12.20062943v1.full.pdf"}|>,
    "fractionOfCriticalDeceased"-><|"value"-> params["fractionOfCriticalDeceased"], "name"-> "Fraction of ICU admissions deceased.", "description"-> "An age adjusted fraction of the ICU admissions that will be deceased.", "type"->"literature",
      "citations"->{"https://www.icnarc.org/DataServices/Attachments/Download/b5f59585-5870-ea11-9124-00505601089b", "https://jamanetwork.com/journals/jama/fullarticle/2762130", "https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf"}|>,
    "importtime"-><|"value"-> fitParams["importtime"], "name"-> "Import Time", "description"-> "The day that COVID-19 was seeded into that state.", "type"->"fit"|>,
    "importlength"-><|"value"-> importlength0, "name"-> "Import duration", "description"-> "Duration of the covid seeding event -- together with the initial infection impulse gets the model kicked off starting at the import time.", "type"->"assumed"|>,
    "initialInfectionImpulse"-><|"value"-> params["initialInfectionImpulse"], "name"-> "Size of initial infection impulse", "description"-> "Size of the initial infection impulse. The model is not very sensitive to the exact value, but it is needed in order to start the virus spreading.", "type"->"assumed"|>,
    "pS"-><|"value"-> params["pS"], "name"-> "Probability of getting a mild case.", "description"-> "An age-adjusted probability that you get a mild case.", "type"->"literature"|>,
    "pH"-><|"value"-> params["pH"], "name"-> "Probability of getting a case bad enough to require hospitalization.", "description"-> "An age-adjusted probability that you get a case requiring hospitalization.", "type"->"literature",
      "citations"->{"https://www.cdc.gov/mmwr/volumes/69/wr/mm6912e2.htm#F1_down", "https://www.medrxiv.org/content/10.1101/2020.04.08.20057794v1.full.pdf"}|>,
    "pC"-><|"value"-> params["pC"], "name"-> "Probability of getting a case bad enough to require ICU admission", "description"-> "An age-adjusted probability get a severe case requiring ICU admission.", "type"->"literature"|>,
    "stateAdjustmentForTestingDifferences"-><|"value"-> fitParams["stateAdjustmentForTestingDifferences"], "name"-> "State adjustment for differences in PCR / death testing and reporting.", "description"-> "A parameter fit to adjust the time difference between PCR and fatality reporting on a state by state basis", "type"->"fit"|>,
    "distancePower"-><|"value"-> fitParams["distpow"], "name"-> "Power of the distancing function", "description"-> "Social distancing effect on reducing susceptibility has a larger effect when densities are higher (eg the original R0 is higher). So we fit a power of the distancing function.", "type"->"fit"|>,
    "numberOfSimulations"-><|"value"->numberOfSimulations, "name"->"Number of Monte Carlo simulations run", "description"->"","type"->"set"|>
  |>
  
 ]


(* helpers to generate the summary csv files that show the model 2 years out and on Aug 1 *)
generateSummaryForState[data_, state_]:= Module[{},
  Join[{state},Values[Association[Join[
          KeyDrop[KeyDrop[KeyDrop[data["scenarios"][#],"timeSeriesData"],"events"],"summary"],
          data["scenarios"][#]["summary"]
    ]]],
    {
      data["r0"],
      data["importtime"],
      data["stateAdjustmentForTestingDifferences"],
      data["distpow"]
    }
  ]&/@Keys[data["scenarios"]]
];

generateAugSummaryForState[data_, state_]:= Module[{},
  Join[{state},Values[Association[Join[
          KeyDrop[KeyDrop[KeyDrop[data["scenarios"][#],"timeSeriesData"],"events"],"summaryAug1"],
          data["scenarios"][#]["summaryAug1"]
    ]]],
    {
      data["r0"],
      data["importtime"],
      data["stateAdjustmentForTestingDifferences"],
      data["distpow"]
    }
  ]&/@Keys[data["scenarios"]]
];


(* write the summaries to csv files *)
exportAllStatesSummary[allStates_]:=Module[{header, rows, table},
  header = {Append[Prepend[Keys[
          Association[Join[
              KeyDrop[KeyDrop[KeyDrop[allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"],"timeSeriesData"],"events"],"summary"],
              allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"]["summary"]
        ]]],"state"], {"r0natural","importtime","stateAdjustmentForTestingDifferences","distpow"}]};
  rows = generateSummaryForState[allStates[#],#]&/@Keys[allStates];

  table = Flatten[Join[{header}, rows],1];

  Export["tests/summary.csv", table];
]

exportAllStatesSummaryAug1[allStates_]:=Module[{header, rows, table},
  header = {Append[Prepend[Keys[
          Association[Join[
              KeyDrop[KeyDrop[KeyDrop[allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"],"timeSeriesData"],"events"],"summaryAug1"],
              allStates[Keys[allStates][[1]]]["scenarios"]["scenario1"]["summaryAug1"]
        ]]],"state"], {"r0natural","importtime","stateAdjustmentForTestingDifferences", "distpow"}]};
  rows = generateSummaryForState[allStates[#],#]&/@Keys[allStates];

  table = Flatten[Join[{header}, rows],1];

  Export["tests/summaryAug1.csv", table];
]

getSeriesForKey[data_, key_]:=Module[{},
  #[key]&/@data
];

(* export each time series as a separate JSON file *)
(* each time series has expected, expectedTestTrace and percentile bands as well as confirmed data points when those are available *)
exportTimeSeries[state_, scenario_, data_]:=Module[{timeData, fixedKeys, timeDataKeys, days, distancing, hospitalCapacity},
  fixedKeys = {"day", "distancing", "hospitalCapacity"};
  timeData = Select[data["timeSeriesData"], #["day"]<=370&];
  timeDataKeys = Keys[KeyDrop[timeData[[1]], fixedKeys]];


  distancing = #["distancing"]&/@data["timeSeriesData"];
  hospitalCapacity = #["hospitalCapacity"]&/@data["timeSeriesData"];

  Export["public/json/"<>state<>"/"<>scenario["id"]<>"/"<>#<>".json", getSeriesForKey[data["timeSeriesData"], #]]&/@timeDataKeys;

  Export["public/json/"<>state<>"/"<>scenario["id"]<>"/distancing.json", distancing];
  Export["public/json/"<>state<>"/"<>scenario["id"]<>"/hospitalCapacity.json", hospitalCapacity];
];


evaluateStateAndPrint[state_, simulationsPerCombo_, backtestMask_]:=Module[{},
  Print["Fitting model for " <> state];
  evaluateState[state, simulationsPerCombo, backtestMask]
];


evaluateBacktestAccuracy[state_, backtestMask_, evaluateSolution_, fitParams_]:=Module[{thisStateData,maxDataDay,deathBacktest,pcrBacktest,backtestStats,res},
  thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>50)&];
  maxDataDay=Max[#["day"]&/@thisStateData];

  deathBacktest = Table[{t,(evaluateSolution[RepDeaq][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t]-evaluateSolution[RepDeaq][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t - 1])*stateParams[state]["population"],Select[thisStateData,#["day"]==t&][[1]]["deathIncrease"],
                  (evaluateSolution[RepDeaq][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t]-evaluateSolution[RepDeaq][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t - 1])*stateParams[state]["population"]-Select[thisStateData,#["day"]==t&][[1]]["deathIncrease"]},{t,maxDataDay-backtestMask,maxDataDay}];
                 
                  
  pcrBacktest = Table[{t,(evaluateSolution[PCR][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t] - evaluateSolution[PCR][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t - 1])*stateParams[state]["population"],Select[thisStateData,#["day"]==t&][[1]]["positiveIncrease"],
                  (evaluateSolution[PCR][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t] - evaluateSolution[PCR][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t - 1])*stateParams[state]["population"]-Select[thisStateData,#["day"]==t&][[1]]["positiveIncrease"]},{t,maxDataDay-backtestMask,maxDataDay}];
                  
             
   backtestStats[backtest_]:=Module[{average, stdev, averagePercent, stdevPercent,filteredBacktest},
      filteredBacktest=Select[backtest,#[[3]]>0&];
      average = (Total[#[[2]]&/@filteredBacktest] - Total[(#[[3]])&/@filteredBacktest]);
      averagePercent = (Total[#[[2]]&/@filteredBacktest] - Total[(#[[3]])&/@filteredBacktest]) / Total[(#[[3]])&/@filteredBacktest];
      <|"average"->average,"averagePercent"->averagePercent|>
   ];
   
   res=<|"death"->backtestStats[deathBacktest],"pcr"->backtestStats[pcrBacktest]|>;
   Echo[res];
   res
];


exportAllStatesBacktest[filename_,allStates_,backtestMask_]:=Module[{header, rows, table, generateBacktestForState},
  header = {"state","backtestDays","deathAverage","deathAveragePercent","pcrAverage","pcrAveragePercent"};
  
  generateBacktestForState[stateOutput_,state_,mask_]:=Module[{bktest},
    bktest=stateOutput["backtest"];
    
    {state,mask,bktest["death"]["average"],bktest["death"]["averagePercent"],bktest["pcr"]["average"],bktest["pcr"]["averagePercent"]}
  ];
  
  rows = generateBacktestForState[allStates[#],#,backtestMask]&/@Keys[allStates];

  table = Join[{header}, rows];
  Export[filename<>"_"<>ToString[backtestMask]<>"_days.csv", table];
];


(* helper to select only values of the simulations within the maximum time domain *)
endTime[ifun_]:=Part[ifun["Domain"],1,-1];


(* once we have generated all the simulations we generate functions that give us the declies of the simulation
  for reporting the error bands *)
  deciles = Range[0,10]/10;



generateTimeSeries[state_,scenario_,sol_,soltt_,simResults_,fitParams_,stateParams_,population_,endOfEval_]:=Module[{
    simDeciles,
    CumulativeCriticalQuantiles,
    CumulativeHospitalizedQuantiles,
    CumulativeRecoveredQuantiles,
    CurrentlyCriticalQuantiles,
    CurrentlyHospitalizedQuantiles,
    CurrentlyInfectedQuantiles,
    CurrentlyInfectiousQuantiles,
    CumulativeExposedQuantiles,
    CurrentlyReportedHospitalizedQuantiles,
    CurrentlyReportedCriticalQuantiles,
    CumulativeReportedHospitalizedQuantiles,
    CurrentlySuseptibleQuantiles,
    CumulativeDeathQuantiles,
    CumulativeReportedDeathQuantiles,
    CumulativeReportedICUDeathQuantiles,
    CumulativeReportedCriticalQuantiles,
    CumulativePCRQuantiles,
    DailyExposedQuantiles,
    DailyPCRQuantiles,
    DailyDeathQuantiles,
    DailyReportedDeathQuantiles,
    DailyReportedICUDeathQuantiles,
    RtQuantiles,
    percentileMap,
    percentileMapTestTrace,
    distancing
},

simDeciles[computationFunction_,simRes_:simResults]:=Quantile[Map[computationFunction, simRes], deciles];

CurrentlySuseptibleQuantiles[t_] :=  simDeciles[#[Sq][t]&] * population;
  CurrentlyInfectedQuantiles[t_] := simDeciles[#[Eq][t]&] * population;
  CurrentlyInfectiousQuantiles[t_] := simDeciles[#[Iq][t]&] * population;
  CurrentlyHospitalizedQuantiles[t_]:=simDeciles[#[HHq][t]+#[HCq][t]&] * population;
  CurrentlyCriticalQuantiles[t_]:=simDeciles[#[CCq][t]&] * population;
  CumulativeRecoveredQuantiles[t_] := simDeciles[#[Rq][t]&] * population;
  CumulativeDeathQuantiles[t_] := simDeciles[#[Deaq][t]&] * population;

  CumulativeExposedQuantiles[t_]:=simDeciles[#[cumEq][t]&] * population;
  CumulativeHospitalizedQuantiles[t_] := simDeciles[(#[EHq][t]+#[EHCq][t])*population &];
  CumulativeReportedHospitalizedQuantiles[t_] := simDeciles[(#[RepHq][t]+#[RepHCq][t])*population &];
  CumulativeCriticalQuantiles[t_] := simDeciles[#[EHCq][t]*population&];
  CumulativeReportedCriticalQuantiles[t_] := simDeciles[#[RepHCq][t]*population&];
  CumulativePCRQuantiles[t_] := simDeciles[#[PCR][t]&] * population;
  CumulativeReportedDeathQuantiles[t_] := simDeciles[#[RepDeaq][t]&] * population;
  CumulativeReportedICUDeathQuantiles[t_] := simDeciles[#[RepDeaICUq][t]&] * population;

  DailyPCRQuantiles[t_] := simDeciles[#[PCR]'[t]&] * population;
  DailyExposedQuantiles[t_]:=simDeciles[#[cumEq]'[t]&] * population;
  DailyDeathQuantiles[t_] := simDeciles[#[Deaq]'[t]&] * population;
  DailyReportedDeathQuantiles[t_] := simDeciles[#[RepDeaq]'[t]&] * population;
  DailyReportedICUDeathQuantiles[t_] := simDeciles[#[RepDeaICUq]'[t]&] * population;
  CurrentlyReportedHospitalizedQuantiles[t_] := simDeciles[Min[population*(#[RepCHHq][t]+#[RepCHCq][t]),(1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"]]&];
  CurrentlyReportedCriticalQuantiles[t_] := simDeciles[population*#[RepCCCq][t]&];

  RtQuantiles[t_] := simDeciles[#[rt][t]&];

  (* define some helpers to generate percentile keys in the json export like "percentile10" etc. *)
  percentileMap[percentileList_]:=Association[MapIndexed[("percentile" <> ToString[10(First[#2]-1)]) -> #1&, percentileList]];
  percentileMapTestTrace[percentileList_]:=Association[MapIndexed[("percentileTestTrace" <> ToString[10(First[#2]-1)]) -> #1&, percentileList]];
  
  (* get the distancing function so that we can report it in the JSON export as a time series *)
  distancing = stateDistancingPrecompute[state][scenario["id"]]["distancingFunction"];

  (* gather all of our time series information into one large association for exporting to JSON *)
  (* takes the expected solutions and evalutes them at each day in the range, as well as the simulation quantiles *)
  
  Table[Association[{
          "day"->t,
          "distancing"-><|
            "expected"->distancing[t],
            (* if test and trace is qualified then we fix the distancing at 80% to represent the current state in South Korea *)
            (* but this value is not actually used in the math (only for display) *)
            "expectedTestTrace"->If[soltt[testAndTraceDelayCounter][t] > testTraceExposedDelay0, 0.8, distancing[t]]
          |>,
          "rt"-><|
            "expected"->sol[rt][t],
            (* if test and trace is qualified for we pin r0 to 1 and only allow for it to decrease due to heterogeneity / less available susceptible individuals *)
            "expectedTestTrace"->soltt[rt][t],
            percentileMap[RtQuantiles[t]]
          |>,
          (* hospital and ICU capacity are ajusted upwards when distancing is higher than 30% *)
          "hospitalCapacity"->(1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"],
          "icuBeds"->stateParams["params"]["icuBeds"],
          "icuCapacity"->stateParams["params"]["icuBeds"]*If[distancing[t]<0.7,0.7,0.7],
          (* we dont predict negative tests yet, but give the confirmed data from COVID tracking for the site *)
          "dailyNegativePcr" -> <|
            "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["negativeIncrease"]]
          |>,
          
          (* case / fatality time series *)
          "dailyPcr" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positiveIncrease"]],
                "expected"-> population*(sol[PCR]'[t]),
                "expectedTestTrace"-> population*(soltt[PCR]'[t])
              |>,
              percentileMap[DailyPCRQuantiles[t]]
            }, First],
          "dailyDeath" -> Merge[{
              <|
                "expected"-> population*(sol[Deaq]'[t]),
                "expectedTestTrace"-> population*(soltt[Deaq]'[t])
              |>,
              percentileMap[DailyDeathQuantiles[t]]
            }, First],
          "dailyReportedDeath" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["deathIncrease"]],
                "expected"-> population*(sol[RepDeaq]'[t]),
                "expectedTestTrace"-> population*(soltt[RepDeaq]'[t])
              |>,
              percentileMap[DailyReportedDeathQuantiles[t]]
            }, First],
          "dailyTestsRequiredForContainment" -> <|
            "expected"-> population*testToAllCaseRatio0*(sol[cumEq]'[t])|>,
          "cumulativePcr" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["positive"]],
                "expected"-> population*sol[PCR][t],
                "expectedTestTrace"-> population*soltt[PCR][t]
              |>,
              percentileMap[CumulativePCRQuantiles[t]]
            }, First],
          "cumulativeNegativePcr" -> <|
            "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, If[KeyExistsQ[Select[stateParams["thisStateData"],(#["day"]==t)&][[1]], "negative"],Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["negative"],0]]
          |>,
          "cumulativeExposed"->Merge[{
              <|
                "expected"-> population*sol[cumEq][t],
                "expectedTestTrace"-> population*soltt[cumEq][t]
              |>,
              percentileMap[CumulativeExposedQuantiles[t]]
            }, First],
          "newlyExposed"->Merge[{
              <|
                "expected"-> population*(sol[cumEq]'[t]),
                "expectedTestTrace"-> population*(soltt[cumEq]'[t])
              |>,
              percentileMap[DailyExposedQuantiles[t]]
            }, First],
          "cumulativeDeaths" -> Merge[{
              <|
                "expected"-> population*sol[Deaq][t],
                "expectedTestTrace"-> population*soltt[Deaq][t]
              |>,
              percentileMap[CumulativeDeathQuantiles[t]]
            }, First],
          "cumulativeReportedDeaths" -> Merge[{
              <|
                "confirmed"-> If[Length[Select[stateParams["thisStateData"],(#["day"]==t)&]] != 1, 0, If[KeyExistsQ[Select[stateParams["thisStateData"],(#["day"]==t)&][[1]],"death"],Select[stateParams["thisStateData"],(#["day"]==t)&][[1]]["death"],0]],
                "expected"-> population*sol[RepDeaq][t],
                "expectedTestTrace"-> population*soltt[RepDeaq][t]
              |>,
              percentileMap[CumulativeReportedDeathQuantiles[t]]
            }, First],
          "currentlyInfected" -> Merge[{
              <|"expected"-> population*sol[Eq][t]|>,
              <|"expectedTestTrace"-> population*soltt[Eq][t]|>,
              percentileMap[CurrentlyInfectedQuantiles[t]]
            }, First],
          "currentlyInfectious" -> Merge[{
              <|
                "expected"-> population*sol[Iq][t],
                "expectedTestTrace"-> population*soltt[Iq][t]
              |>,
              percentileMap[CurrentlyInfectiousQuantiles[t]]
            }, First],
          "cumulativeRecoveries" -> Merge[{
              <|
                "expected"-> population*sol[Rq][t],
                "expectedTestTrace"-> population*soltt[Rq][t]
              |>,
              percentileMap[CumulativeRecoveredQuantiles[t]]
            }, First],
          "susceptible" -> Merge[{
              <|
                "expected"-> population*sol[Sq][t],
                "expectedTestTrace"-> population*soltt[Sq][t]
              |>,
              percentileMap[CurrentlySuseptibleQuantiles[t]]
            }, First],
          "currentlyMildOrAsymptomatic"->Merge[{
            <|"expected"->population*sol[ISq][t]|>,
            <|"expectedTestTrace"->population*soltt[ISq][t]|>
          },First],
          "cumulativeMildOrAsymptomatic"->Merge[{
            <|"expected"->population*sol[ESq][t]|>,
            <|"expectedTestTrace"->population*soltt[ESq][t]|>
          },First],
          (* hospitalization and ICU time series *)
          "currentlyReportedHospitalized" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCurrentData"],
                      (#["day"]==t)&][[1]],"hospitalizations"],
                  Select[stateParams["hospitalizationCurrentData"],(#["day"]==t)&][[1]]["hospitalizations"],
                  0],
                "expected"-> Min[population*(sol[RepCHHq][t - daysForHospitalsToReportCases0](*+sol[RepCHCq][t - daysForHospitalsToReportCases0]*)), (1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"]],
                "expectedTestTrace"-> Min[population*(soltt[RepCHHq][t - daysForHospitalsToReportCases0](*+soltt[RepCHCq][t - daysForHospitalsToReportCases0]*)), (1-stateParams["params"]["bedUtilization"]*If[distancing[t]<0.7,0.5,1])*stateParams["params"]["staffedBeds"]]
              |>,
              percentileMap[CurrentlyReportedHospitalizedQuantiles[t - daysForHospitalsToReportCases0]]
            }, First],
          "currentlyHospitalized" -> Merge[{
              <|
                "expected"-> population*(sol[HHq][t](*+sol[HCq][t]*)),
                "expectedTestTrace"-> population*(soltt[HHq][t](*+soltt[HCq][t]*))
              |>,
              percentileMap[CurrentlyHospitalizedQuantiles[t]]
            }, First],
          "cumulativeReportedHospitalized" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["hospitalizationCumulativeData"],
                      (#["day"]==t)&][[1]],"hospitalizations"],
                  Select[stateParams["hospitalizationCumulativeData"],(#["day"]==t)&][[1]]["hospitalizations"],
                  0],
                "expected"->population*(sol[RepHq][t - daysForHospitalsToReportCases0](*+sol[RepHCq][t - daysForHospitalsToReportCases0]*)),
                "expectedTestTrace"-> population*(soltt[RepHq][t - daysForHospitalsToReportCases0](*+soltt[RepHCq][t - daysForHospitalsToReportCases0]*))
              |>,
              percentileMap[CumulativeReportedHospitalizedQuantiles[t - daysForHospitalsToReportCases0]]
            }, First],
          "cumulativeHospitalized" -> Merge[{
              <|
                "expected"->population*(sol[EHq][t](*+sol[EHCq][t]*)),
                "expectedTestTrace"->population*(soltt[EHq][t](*+soltt[EHCq][t]*))
              |>,
              percentileMap[CumulativeHospitalizedQuantiles[t]]
            }, First],
          "cumulativeReportedCritical" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["icuCumulativeData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCumulativeData"],
                      (#["day"]==t)&][[1]],"icu"],
                  Select[stateParams["icuCumulativeData"],(#["day"]==t)&][[1]]["icu"],
                  0],
                "expected"->population*(sol[RepHCq][t - daysForHospitalsToReportCases0]),
                "expectedTestTrace"->population*(soltt[RepHCq][t - daysForHospitalsToReportCases0])
              |>,
              percentileMap[CumulativeReportedCriticalQuantiles[t - daysForHospitalsToReportCases0]]
            }, First],
            "cumulativeCritical" -> Merge[{
              <|
                "expected"->population*(sol[EHCq][t]),
                "expectedTestTrace"->population*(soltt[EHCq][t])
              |>,
              percentileMap[CumulativeCriticalQuantiles[t]]
            }, First],
          "currentlyReportedCritical" -> Merge[{
              <|
                "confirmed"->If[
                  Length[Select[stateParams["icuCurrentData"],(#["day"]==t)&]]==1 && KeyExistsQ[Select[stateParams["icuCurrentData"],
                      (#["day"]==t)&][[1]],"icu"],
                  Select[stateParams["icuCurrentData"],(#["day"]==t)&][[1]]["icu"],
                  0],
                "expected"->population*sol[RepCCCq][t - daysForHospitalsToReportCases0],
                "expectedTestTrace"-> population*soltt[RepCCCq][t - daysForHospitalsToReportCases0]
              |>,
              percentileMap[CurrentlyReportedCriticalQuantiles[t - daysForHospitalsToReportCases0]]
            }, First],
          "currentlyCritical" -> Merge[{
              <|
                "expected"->population*sol[CCq][t],
                "expectedTestTrace"-> population*soltt[CCq][t]
              |>,
              percentileMap[CurrentlyCriticalQuantiles[t]]
            }, First],
          "currentlyHospitalizedOrICU" -> Merge[{
            <|"expected"->population*(sol[HHq][t]+sol[HCq][t]+sol[CCq][t])|>,
            <|"expectedTestTrace"->population*(soltt[HHq][t]+soltt[HCq][t]+soltt[CCq][t])|>
          },First]
      }], {t, Floor[fitParams["importtime"]] - 5, endOfEval}] 
];


generateSummaries[events_,eventstt_,sol_,population_,timeSeriesData_,endOfEval_,endOfEvalAug1_]:=Module[{hasContainment, hasHospitalOverload, hasIcuOverload, containmentTime, hospitalOverloadTime, icuOverloadTime},
  (* define events / helpers for reporting, eg when we exceed capacity *)
  hasContainment = KeyExistsQ[eventstt, "containment"];
  hasHospitalOverload = KeyExistsQ[events, "hospital"];
  hasIcuOverload = KeyExistsQ[events, "icu"];

  containmentTime = If[hasContainment,eventstt["containment"]["day"]];
  hospitalOverloadTime = If[hasHospitalOverload,events["hospital"]["day"]];
  icuOverloadTime = If[hasIcuOverload,events["icu"]["day"]];

  (* generate summary statistics at 2 years from the start (end of 2021) and August 1st *)
  (* we use these to check against literature values in the paramter table *)
  (* https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 *)
  Map[
    Function[t, <|
        "totalProjectedDeaths"->sol[Deaq][t] * population,
        "totalProjectedPCRConfirmed"-> sol[PCR][t] * population,
        "totalProjectedInfected"->  sol[cumEq][t] * population,
        "totalInfectedFraction"-> sol[cumEq][t],
        "fatalityRate"-> sol[Deaq][t] /  sol[cumEq][t],
        "fatalityRateSymptomatic"-> sol[Deaq][t] / (fractionSymptomatic0 * sol[cumEq][t]),
        "fatalityRatePCR"-> sol[Deaq][t] / sol[PCR][t],
        "fractionOfSymptomaticHospitalized"-> sol[EHq][t] / (fractionSymptomatic0 * sol[cumEq][t]),
        "fractionOfSymptomaticHospitalizedOrICU"-> (sol[EHq][t]+sol[EHCq][t]) / (fractionSymptomatic0 * sol[cumEq][t]),
        "fractionOfPCRHospitalized"-> sol[RepHq][t] / sol[PCR][t],
        "fractionOfPCRHospitalizedOrICU"-> (sol[RepHq][t] + sol[RepHCq][t]) / sol[PCR][t],
        "fractionHospitalizedInICU"->(sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]),
        "fractionOfDeathInICU"->(sol[RepDeaICUq][t]) / (sol[RepDeaq][t]),
        "fractionDeathOfHospitalizedOrICU"->((sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]))*(fractionOfCriticalDeceased0 + (1 - ((sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t])))*fractionOfHospitalizedNonCriticalDeceased0/((sol[EHCq][t]) / (sol[EHq][t] + sol[EHCq][t]))),
        "fractionOfInfectionsPCRConfirmed"-> sol[PCR][t] / (sol[cumEq][t]),
        "fractionOfDeathsReported"-> sol[RepDeaq][t] / sol[Deaq][t],
        "fractionOfHospitalizationsReported"-> sol[RepHq][t] / sol[EHq][t],
        "dateContained"->If[!TrueQ[containmentTime == Null],
          DateString[DatePlus[{2020,1,1},containmentTime-1]],
          ""],
        "dateICUOverCapacity"->If[!TrueQ[icuOverloadTime == Null],
          DateString[DatePlus[{2020,1,1},icuOverloadTime-1]],
          ""],
        "dateHospitalsOverCapacity"->If[!TrueQ[hospitalOverloadTime == Null],
          DateString[DatePlus[{2020,1,1}, hospitalOverloadTime - 1]],
          ""]|>],
    {
      If[hasContainment,containmentTime,endOfEval],
      If[hasContainment, Min[containmentTime, endOfEvalAug1], endOfEvalAug1]}
  ]
];
