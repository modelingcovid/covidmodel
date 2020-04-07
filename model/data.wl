(* ::Package:: *)

SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

(* Utils *)
today=QuantityMagnitude[DateDifference[DateList[{2020,1,1}],Today]];
dataFile[name_] := $UserDocumentsDirectory <> "/Github/covidmodel/model/data/" <> name;

(* model predict max/min 1 is Jan 1st 2020 *)
tmax0 = 365 * 2;
tmin0 = 1;

(* get data for age distribution and cache it in a json file *)
queryAlphaForDistribution[place_] :=
Which[
  place == "United States",
  WolframAlpha["United States age distribution",
    {{"AgeDistributionGrid:ACSData",1},"ComputableData"},PodStates->{"AgeDistributionGrid:ACSData__Show details"}],
  StringLength[place] == 2,
  WolframAlpha[StringTemplate["`` state age distribution"][place],
    {{"AgeDistributionGrid:ACSData",1},"ComputableData"},PodStates->{"AgeDistributionGrid:ACSData__Show details"}],
  True, WolframAlpha[StringTemplate["`` age distribution"][place],
    {{"AgeDistributionGrid:AgeDistributionData",1},"ComputableData"},
    PodStates->{"AgeDistributionGrid:AgeDistributionData__Show details"}]];

ageDistributionFor[place_] := Module[{rawdist, pop, dist, buckets},
  rawdist = queryAlphaForDistribution[place];
  pop = QuantityMagnitude[Last[rawdist][[4]]];
  dist = {StringCases[#[[1]], NumberString][[1]] // ToExpression,
    QuantityMagnitude[#[[4]]/pop]} & /@ (Most@Rest@rawdist);
  buckets=(#[[1]]) & /@ dist;
  <|
    "Population" -> pop,
    "Distribution" -> dist,
    "Buckets" -> buckets
  |>
];

exportDistributionJSON[] := With[{places = countries ~Join~ USStates},
  Export[dataFile["age-distributions.json"], AssociationMap[ageDistributionFor, places]]];

cachedAgeDistributionFor[place_] := Module[{placeData},
  placeData = Import[dataFile["age-distributions.json"]];
  Association[Association[placeData][place]]];

(* country level data *)
countries={"United States","France","Spain","Italy"};

countryHistoricalDistancing[country_,t_]:=Association[{
    "Italy"->{{1,t<58},{0.8,58<=t<68},{0.5,68<=t<75},{0.3,68<=t<200},{1,200<=t<=tmax}},
    "France"->{{1,t<64},{0.8,64<=t<74},{0.35,74<=t<81},{0.35,81<=t<200},{1,200<=t<=tmax}},
    "Spain"->{{1,t<73},{0.6,74<=t<=81},{0.4,81<=t<200},{1,200<=t<=tmax}},
    "United States"->{{1,t<85},{0.8,85<=t<85+14},{0.4,85+14<=t<200},{1,200<=t<=tmax}}}][country];

countryVentilators = Association[{"United States"->61929,"France"->5000,"Italy"->3000,"Spain"->2000}];

countryImportTime=Association[{"United States"->62,"France"->55,"Italy"->45,"Spain"->53}];

(* https://docs.google.com/spreadsheets/d/1-kffWhXDyR4s0hL9YWG2ld0QWcCkxp8YxrbwFp52MJg *)
italyDataRaw=Import[dataFile["italy.csv"]];
italyDataHeader=italyDataRaw[[1]];
italyDataBody=italyDataRaw[[2;;]];
italyData=Thread[italyDataHeader->#]&/@italyDataBody//Map[Association];

franceDataRaw=Import[dataFile["france.csv"]];
franceDataHeader=franceDataRaw[[1]];
franceDataBody=franceDataRaw[[2;;]];
franceData=Thread[franceDataHeader->#]&/@franceDataBody//Map[Association];

spainDataRaw=Import[dataFile["spain.csv"]];
spainDataHeader=spainDataRaw[[1]];
spainDataBody=spainDataRaw[[2;;]];
spainData=Thread[spainDataHeader->#]&/@spainDataBody//Map[Association];

ItalyPopulation=60.48*10^6;

FrancePopulation = 66.99*10^6;

SpainPopulation=46.66*10^6;

usData = Append[#, "day" ->
  QuantityMagnitude[DateDifference[DateList[{2020,1,1}], DateList[#["date"] // ToString]]]] & /@
URLExecute[URLBuild["https://covidtracking.com/api/us/daily"],"RawJSON"];

countryData = Association[{"United States"->usData,"France"->franceData,"Spain"->spainData,"Italy"->italyData}];

(* state level data *)
ventilators=Association[{"AL"->920,"AK"->104,"AZ"->1309,"AR"->633,"CA"->6589,"CO"->913,"CT"->688,"DE"->200,"FL"->4307,"GA"->2093,"HI"->241,"ID"->182,"IL"->2311,"IN"->1472,"IA"->542,"KS"->514,"KY"->949,"LA"->1109,"ME"->214,"MD"->953,"MA"->1408,"MI"->1847,"MN"->811,"MS"->769,"MO"->1437,"MT"->158,"NE"->466,"NV"->753,"NH"->207,"NJ"->1487,"NM"->366,"NY"->4506,"NC"->1782,"ND"->180,"OH"->2729,"OK"->740,"OR"->503,"PA"->3013,"RI"->196,"SC"->949,"SD"->149,"TN"->1517,"TX"->5419,"UT"->503,"VT"->90,"VA"->1334,"WA"->836,"WV"->550,"WI"->864,"WY"->117}];

(* download csv here https://docs.google.com/spreadsheets/d/16gJ6CEr6esVQ7guQCcz87j4S7Zt2GbIlOCqdVP9aGx0/edit#gid=1561124985 *)
hospitalizationsRawData=Import[dataFile["hospitalized.csv"]];
hospitalizationsHeader=hospitalizationsRawData[[1]];
hospitalizationsBody=hospitalizationsRawData[[2;;]];
hospitalizationsParsedData=Thread[hospitalizationsHeader->#]&/@hospitalizationsBody//Map[Association];
stateHospitalizationData[state_]:=Select[Association[{"day"->#["State"], "hospitalizations"->If[#[state]=="",0,#[state]]}]&/@hospitalizationsParsedData,#["hospitalizations"]>0&]

(* some states report differently, we need to toggle where to put the data *)
hospitalizationsCurrentOrCumulative = <|
  "CA"->"current",
  "CO"->"cumulative",
  "CT"->"current",
  "FL"->"cumulative",
  "GA"->"cumulative",
  "LA"->"current",
  "MA"->"cumulative",
  "MD"->"cumulative",
  "MS"->"current",
  "NY"->"cumulative",
  "OH"->"cumulative",
  "OK"->"current",
  "OR"->"cumulative",
  "PA"->"current",
  "SC"->"current",
  "VA"->"current",
  "VT"->"current"
|>;

(* Data from covidtracking on reported PCR and fatalities *)
stateData = URLExecute[URLBuild["https://covidtracking.com/api/states/daily"],"RawJSON"];
(* remove data when there is only one positive case / death since that doesn't contain any trend information *)
parsedData = Merge[{
    <|"death"-> If[KeyExistsQ[#,"death"],If[TrueQ[#["death"]<=2] || TrueQ[#["death"]==Null],Null,#["death"]],Null]|>,
    <|"positive"-> If[KeyExistsQ[#,"positive"],If[TrueQ[#["positive"]<=4] || TrueQ[#["positive"]==Null],Null,#["positive"]],Null]|>,
    #},First]&/@(Append[#,"day"->QuantityMagnitude[DateDifference[DateList[{2020,1,1}],DateList[#["date"]//ToString]]]]&/@stateData);
statesWith50CasesAnd5Deaths = DeleteDuplicates[#["state"]&/@Select[parsedData,(#["positive"]>=50&&#["death"]>=5)&]];
stateRawDemographicData = Association[(#->cachedAgeDistributionFor[#])&/@statesWith50CasesAnd5Deaths];
stateImportTime = Association[{"NY"->56,"AZ"->63,"CA"->56,"CO"->55,"CT"->57,"FL"->56,"GA"->52,"IL"->58,"IN"->58,"MA"->58, "MI"->59,"NJ"->56,"NV"->58,"OH"->61,"PA"->62,"SC"->59,"TX"->61,"VA"->58,"VT"->54,"WA"->41,"WI"->60,"LA"->51,"OR"->55}];

(* data cached from https://coronavirus-resources.esri.com/datasets/definitivehc::definitive-healthcare-usa-hospital-beds?geometry=53.086%2C-16.820%2C-78.047%2C72.123 *)
icuRawData=Import["model/data/icu-beds.csv","CSV"];
icuHeader=icuRawData[[1]];
icuBody=icuRawData[[2;;]];
icuParsedData=Thread[icuHeader->#]&/@icuBody//Map[Association];
stateICURawData=GroupBy[icuParsedData,#["HQ_STATE"]&];
stateICUData=<|"icuBeds"->Sum[If[#[[i]]["NUM_ICU_BEDS"] == "",0,#[[i]]["NUM_ICU_BEDS"]],{i,1,Length[#]}],
  "staffedBeds"->Sum[If[#[[i]]["NUM_STAFFED_BEDS"] == "",0,#[[i]]["NUM_STAFFED_BEDS"]],{i,1,Length[#]}],
  "bedUtilization"->Sum[If[#[[i]]["BED_UTILIZATION"] == "",0,#[[i]]["BED_UTILIZATION"]],{i,1,Length[#]}]/Sum[If[#[[i]]["BED_UTILIZATION"] == "",0,1],{i,1,Length[#]}]
|>&/@stateICURawData; //Quiet

(* State percent of positive tests *)
statePositiveTestRawData=Import[dataFile["positive-test.csv"]];
statePositiveTestRawDataHeader=statePositiveTestRawData[[1]];
statePositiveTestRawDataBody=statePositiveTestRawData[[2;;]];
statePositiveTestData=Merge[{KeyDrop[#,"State"],Association[{"day"->#["State"]}]},First]&/@(Thread[statePositiveTestRawDataHeader->#]&/@statePositiveTestRawDataBody//Map[Association]);


(* a time varying probability that an individual might get tested *)
(* this hopefully adjusts for the fact that at early stages not everyone was being tested and the resulting reported positive tests is artificially surpressed *)
(* This function returns a mock up of figure 2B from https://www.medrxiv.org/content/10.1101/2020.03.15.20036582v2.full.pdf?fbclid=IwAR3YPwHgPdlv_5V-4TOgTKlxCxH7J4SC-r5AiqXxG4lbngq9wpstnXKiEs0 *)
(* we've extended that curve toward the future to account for the peak in testing probability that occured in Mid-march *)
testingProbability = Module[{rawData,interpolatedData},
  rawData={
    {1,.4},
    {32.09419441329686, 0.38560995692669275},
    {36.59500746852255, 0.20273418266226972},
    {41.61011002106081, 0.08926560217807777},
    {50.31847352501851, 0.034472714032133256},
    {60.68717855354785, 0.0656311418771025},
    {64.19097074242492, 0.14092046954456494},
    {67.13151633765169, 0.33095609501781265},
    {71.55097421808084, 0.724688328830152},
    {85,1},
    {tmax0,1}};
  interpolatedData=GaussianFilter[Interpolation[rawData,InterpolationOrder->1][Range[1,tmax0]],4];
  Interpolation[interpolatedData]
];

(* to turn off the testingProbability, uncomment the following: *)
(* testingProbability=(1)&; *)


(* grab state distancing data and return smoothed distancing functions for each scenario in the list of scenarios provided. *)
(* data from https://docs.google.com/spreadsheets/d/13woalkLKdCHG1x1jTzR3rrYiYOPlNAKyaLVChZgenu8/edit#gid=1922212346 *)
(* TODO: we need to be able to split this up into a scenario dependent part and a non-scenario dependent part for fitting parameters *)
stateDistancingPrecompute = Module[{
    totalDays,
    rawCsvTable,
    stateLabels,
    dataDays,
    stateDistancings,
    countStates,
    fullDays,
    processScenario,
    processState,
    smoothing,
    SlowJoin,
    ApplyWhere
  },

  rawCsvTable = Transpose[Import[dataFile["state-distancing.csv"]]];

  dataDays = rawCsvTable[[1,2;;]];
  stateDistancings = 1-rawCsvTable[[2;;,2;;]]/100;
  stateLabels = rawCsvTable[[2;;,1]];
  countStates = Length[stateLabels];

  totalDays = tmax0;
  fullDays = Range[totalDays];

  smoothing = 3;
  SlowJoin := Fold[Module[{smoother},
      smoother=1-Exp[-Range[Length[#2]]/smoothing];
      Join[#1, Last[#1](1-smoother)+#2 smoother]]&];
  ApplyWhere[list_,condition_,func_]:=Module[{i,l},
    i=Pick[Range[Length[list]],Map[condition,list]];
    l=list;
    l[[i]]=func[list[[i]]];
    l
  ];

  processScenario[scenario_, distancing_] := Module[{
      distancingLevel,
      fullDistancing,
      smoothedDistancing,
      smoothedFullDistancing,
      distancingFunction,
      distancingDelay
    },

    distancingLevel = If[
      scenario["maintain"],Mean[distancing[[-7;;]]],scenario["distancingLevel"]];

    (* policy distancing filled with 1s to complete a full year *)
    fullDistancing = Join[
      (* pre-policy distancing - constant at 1 *)
      ConstantArray[1., Min[dataDays] - 1],
      (* historical distancing data *)
      distancing,
      (* for any gap between the last day of data and today, fill in with the average of the last three days of data *)
      ConstantArray[Mean[distancing[[-3;;]]], today - Max[dataDays]],
      (* moving average going forward in the scenario *)
      ConstantArray[distancingLevel, scenario["distancingDays"]],
      (* post-policy distancing - constant at 1 *)
      ConstantArray[1.,
        totalDays - scenario["distancingDays"] - today]];

    smoothedDistancing = ApplyWhere[
      distancing,
      #<1&,
      GaussianFilter[#,smoothing]&];

    smoothedFullDistancing = SlowJoin[{
        ConstantArray[1., Min[dataDays] - 1],
        smoothedDistancing,
        ConstantArray[Mean[smoothedDistancing[[-3;;]]], today - Max[dataDays]],
        ConstantArray[distancingLevel, scenario["distancingDays"]],
        ConstantArray[1., totalDays - scenario["distancingDays"] - today]
      }];

    distancingDelay = 5;
    distancingFunction = Interpolation[Transpose[{
          fullDays + distancingDelay,
          smoothedFullDistancing}],InterpolationOrder->3];

    scenario["id"]-><|
      "distancingLevel"->distancingLevel,
      "distancingData"->fullDistancing,
      "distancingFunction"->distancingFunction|>
  ];

  processState[state_,distancing_] :=
  state->Association[Map[processScenario[#,distancing]&,scenarios]];

  Association[MapThread[processState,{stateLabels,stateDistancings}]]
];


maxPosTestDay=Max[#["day"]&/@statePositiveTestData];
statesWithRates=DeleteCases[DeleteCases[DeleteCases[DeleteCases[DeleteCases[Keys[Select[statePositiveTestData,#["day"]==maxPosTestDay&][[1]]][[;;25]],"MS"],"SC"],"MD"],"AZ"],"OH"];
avgLastThreeDays=KeyDrop[Merge[Select[statePositiveTestData,#["day"]==maxPosTestDay&],If[Length[Select[#,#!=""&]]!=0,Mean[Select[#,#!=""&]],Null]&],"day"];
removeZeros[association_]:=Module[{inv},
  inv = association // Normal // GroupBy[Last -> First];
  inv[""]
]
stripOthers[row_, state_]:=Module[{},
  DeleteCases[DeleteCases[Keys[row],state],"day"]
];
evalStatePosTest[state_]:=Module[{thisStateData, minDay, rollingAvg, valueOnEarliestDay, onlyThisState, valueOnLatestDay, filledFuturePositive, filledPastZeroPositive, fullPostTestData, maxDay, joinedData},
  If[MemberQ[statesWithRates,state],
    thisStateData=Select[statePositiveTestData,#[state]!=""&];
    onlyThisState=KeyDrop[#,stripOthers[#,state]]&/@thisStateData;
    rollingAvg=MovingMap[Mean, {#["day"],#[state]/100}&/@onlyThisState,{3,Right}];

    maxDay=Max[#[[1]]&/@rollingAvg];
    valueOnLatestDay=Max[#[[2]]&/@Select[rollingAvg,#[[1]]==maxDay&]];
    filledFuturePositive=Table[{i,valueOnLatestDay},{i,maxDay+1,tmax0}];

    minDay=Min[#[[1]]&/@rollingAvg];
    valueOnEarliestDay=Min[#[[2]]&/@Select[rollingAvg,#[[1]]==minDay&]];

    filledPastZeroPositive={#-1, valueOnEarliestDay}&/@Range[Min[#["day"]&/@statePositiveTestData]+2];

    fullPostTestData=Join[filledPastZeroPositive,rollingAvg,filledFuturePositive];
    Interpolation[fullPostTestData],

    Interpolation[{{0,0.15},{365,0.15}},InterpolationOrder->1]]
];
posInterpMap=Association[{#->evalStatePosTest[#]}&/@statesWith50CasesAnd5Deaths];


Needs["HypothesisTesting`"]


toLog[x_] := Log[x]


ClearAll[fromLog]
SetAttributes[fromLog, HoldAll];
fromLog[y_] := Exp[y]
fromLog[(fit_)["ParameterTable"]] :=
fit["ParameterTable"] /. Grid[array_, options___] :> Module[{a = array},
  a[[2;;]] = Replace[a[[2;;]],
    {p_, v_, se_, t_, pr_} :> {fromLog[p], fromLog[v], fromLog[v]*se, t, pr}, {1}];
  a = Replace[a, {p_, (v_)?NumberQ, se_, t_, pr_} :> {p, v, se, v/se,
      (N[#1, 6] & )[TwoSidedPValue /. StudentTPValue[v/se,
          fit["ANOVATableDegreesOfFreedom"][[2]], TwoSided -> True]]}, {1}];
  Grid[a, options]
]
