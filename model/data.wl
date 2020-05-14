(* ::Package:: *)

(* This module gathers data from various sources via API calls and then parses them *)
(* into the formats required by the model *)

SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"];

(* Utils *)
today=QuantityMagnitude[DateDifference[DateList[{2020,1,1}],Today]];
dataFile[name_] := $UserDocumentsDirectory <> "/Github/covidmodel/model/data/" <> name;

(* model predict max/min 1 is Jan 1st 2020 *)
tmax0 = 365 * 2;
tmin0 = 1;
twoWeeksFromNow=today + 14; (* actually may 10 *)
twoWeeksFromNowQuantity=Today+Quantity[14,"days"];

(* define scenario associations, days is required, level is optional if you maintain, need to flag maintain *)
(* maintain takes the last day of data from the historicals and uses that as the distancing level *)
scenario1=<|"id"->"scenario1","distancingDays"->90,"maintain"->True,"name"->"Current", "gradual"->False|>;
scenario2=<|"id"->"scenario2","distancingDays"->90,"distancingLevel"->0.2,"maintain"->False,"name"->"Italy", "gradual"->False|>;
scenario3=<|"id"->"scenario3","distancingDays"->60,"distancingLevel"->0.11,"maintain"->False,"name"->"Wuhan", "gradual"->False|>;
scenario4=<|"id"->"scenario4","distancingDays"->90,"distancingLevel"->1,"maintain"->False,"name"->"Normal", "gradual"->False|>;
scenario5=<|"id"->"scenario5","distancingDays"->tmax0-today-1,"maintain"->True,"name"->"Current Indefinite", "gradual"->False|>;
scenario6=<|"id"->"scenario6","distancingDays"->twoWeeksFromNow-today,"maintain"->True,"name"->"Open "<>DateString[twoWeeksFromNowQuantity,{"MonthName"," ","Day"}], "gradual"->False|>;
scenario7=<|"id"->"scenario7","distancingDays"->60,"maintain"->True, "name"->"Open Gradual "<>DateString[twoWeeksFromNowQuantity,{"MonthName"," ","Day"}], "gradual"->True|>;
scenario8=<|"id"->"scenario8","distancingDays"->tmax0-today-1,"maintain"->False,"distancingLevel"->0.7, "name"->"relaxed restrictions", "gradual"->False|>;

scenarios={scenario5,scenario1,scenario2,scenario3,scenario4,scenario6,scenario7,scenario8};

(* helper to get the scenario for a given id *)
scenarioFor[name_] := Select[scenarios,#["id"]== name&][[1]];


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

ItalyPopulation=60.48*10^6;
FrancePopulation = 66.99*10^6;
SpainPopulation=46.66*10^6;

usData = Append[#, "day" ->
  QuantityMagnitude[DateDifference[DateList[{2020,1,1}], DateList[#["date"] // ToString]]]] & /@
URLExecute[URLBuild["https://covidtracking.com/api/v1/us/daily.json"],"RawJSON"];

countryData = Association[{"United States"->usData,"France"->franceData,"Spain"->spainData,"Italy"->italyData}];

(* state level data *)
ventilators=Association[{"AL"->920,"AK"->104,"AZ"->1309,"AR"->633,"CA"->6589,"CO"->913,"CT"->688,"DE"->200,"FL"->4307,"GA"->2093,"HI"->241,"ID"->182,"IL"->2311,"IN"->1472,"IA"->542,"KS"->514,"KY"->949,"LA"->1109,"ME"->214,"MD"->953,"MA"->1408,"MI"->1847,"MN"->811,"MS"->769,"MO"->1437,"MT"->158,"NE"->466,"NV"->753,"NH"->207,"NJ"->1487,"NM"->366,"NY"->4506,"NC"->1782,"ND"->180,"OH"->2729,"OK"->740,"OR"->503,"PA"->3013,"RI"->196,"SC"->949,"SD"->149,"TN"->1517,"TX"->5419,"UT"->503,"VT"->90,"VA"->1334,"WA"->836,"WV"->550,"WI"->864,"WY"->117}];



(* Data from covidtracking on reported PCR and fatalities *)
stateData = URLExecute[URLBuild["https://covidtracking.com/api/v1/states/daily.json"],"RawJSON"];
(* remove data when there is only one positive case / death since that doesn't contain any trend information *)
stateParsedData = Merge[{
    <|"death"-> If[KeyExistsQ[#,"death"],If[TrueQ[#["death"]<=2] || TrueQ[#["death"]==Null],Null,#["death"]],Null]|>,
    <|"positive"-> If[KeyExistsQ[#,"positive"],If[TrueQ[#["positive"]<=4] || TrueQ[#["positive"]==Null],Null,#["positive"]],Null]|>,
    #},First]&/@(Append[#,"day"->QuantityMagnitude[DateDifference[DateList[{2020,1,1}],DateList[#["date"]//ToString]]]]&/@stateData);

franceData=<|"day"->Floor[QuantityMagnitude[DateDifference[DateObject[{2020,1,1}], DateObject[#["last_update"]]]]],"state"->"France", "death"->#["deaths"],"positive"->#["confirmed"]|>&/@URLExecute[URLBuild["https://api.covid19data.cloud/v1/jh/daily-reports/?limit=100&country=France"], "RawJSON"];
spainData=<|"day"->Floor[QuantityMagnitude[DateDifference[DateObject[{2020,1,1}], DateObject[#["last_update"]]]]],"state"->"Spain", "death"->#["deaths"],"positive"->#["confirmed"]|>&/@URLExecute[URLBuild["https://api.covid19data.cloud/v1/jh/daily-reports/?limit=100&country=Spain"], "RawJSON"];
italyData=<|"day"->Floor[QuantityMagnitude[DateDifference[DateObject[{2020,1,1}], DateObject[#["last_update"]]]]],"state"->"Italy", "death"->#["deaths"],"positive"->#["confirmed"]|>&/@URLExecute[URLBuild["https://api.covid19data.cloud/v1/jh/daily-reports/?limit=100&country=Italy"], "RawJSON"];

countryData=Join[franceData,spainData,italyData];

parsedData=Join[countryData,stateParsedData];

statesWith50CasesAnd5Deaths = DeleteDuplicates[#["state"]&/@Select[parsedData,(#["positive"]>=50&&#["death"]>=5)&]];
stateRawDemographicData = Association[(#->cachedAgeDistributionFor[#])&/@statesWith50CasesAnd5Deaths];
(*stateImportTime = Association[{"NY"->56,"AZ"->63,"CA"->56,"CO"->55,"CT"->57,"FL"->56,"GA"->52,"IL"->58,"IN"->58,"MA"->58, "MI"->59,"NJ"->56,"NV"->58,"OH"->61,"PA"->62,"SC"->59,"TX"->61,"VA"->58,"VT"->54,"WA"->41,"WI"->60,"LA"->51,"OR"->55}];*)



statesWithTrustedHospitalization={"AZ","CA","CO","CT","FL","GA","LA","MA","MD","MI","MS","NJ","NV","NY","OH","OK","OR","PA","TX","VA","WI"};
trustedHospitalizationData=Select[stateParsedData,MemberQ[statesWithTrustedHospitalization,#["state"]]&];

stateICUCurrentActualsData[state_]:=Module[{data},
  data = Select[Association[{"day"->#["day"], "icu"->#["inIcuCurrently"]}]&/@Select[trustedHospitalizationData,#["state"]==state&],#["icu"]>0&];
  If[Length[data]<=1,{},data]
];

stateICUCumulativeActualsData[state_]:=Module[{data},
  data = Select[Association[{"day"->#["day"], "icu"->#["inIcuCumulative"]}]&/@Select[trustedHospitalizationData,#["state"]==state&],#["icu"]>0&];
  If[Length[data]<=1,{},data]
];

stateHospitalizationCurrentActualsData[state_] := Module[{data},
  data = Select[Association[{"day"->#["day"], "hospitalizations"->#["hospitalizedCurrently"]}]&/@Select[trustedHospitalizationData,#["state"]==state&],#["hospitalizations"]>0&];
  If[Length[data]<=1,{},data]
];

stateHospitalizationCumulativeActualsData[state_] := Module[{data},
  data = Select[Association[{"day"->#["day"], "hospitalizations"->#["hospitalizedCumulative"]}]&/@Select[trustedHospitalizationData,#["state"]==state&],#["hospitalizations"]>0&];
  If[Length[data]<=1,{},data]
];


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


parseCsv[url_]:=Module[{raw,header,body},
  raw=Import[url,"CSV"];
  header=raw[[1]];
  body=raw[[2;;]];
  Thread[header->#]&/@body//Map[Association]
];

codesToStates=<|"AL" -> "Alabama",
  "AK" -> "Alaska",
  "AZ" -> "Arizona",
  "AR" -> "Arkansas",
  "CA" -> "California",
  "CO" -> "Colorado",
  "CT" -> "Connecticut",
  "DC" -> "District of Columbia",
  "DE" -> "Delaware",
  "FL" -> "Florida",
  "GA" -> "Georgia",
  "HI" -> "Hawaii",
  "ID" -> "Idaho",
  "IL" -> "Illinois",
  "IN" -> "Indiana",
  "IA" -> "Iowa",
  "KS" -> "Kansas",
  "KY" -> "Kentucky",
  "LA" -> "Louisiana",
  "ME" -> "Maine",
  "MD" -> "Maryland",
  "MA" -> "Massachusetts",
  "MI" -> "Michigan",
  "MN" -> "Minnesota",
  "MS" -> "Mississippi",
  "MO" -> "Missouri",
  "MT" -> "Montana",
  "NE" -> "Nebraska",
  "NV" -> "Nevada",
  "NH" -> "New Hampshire",
  "NJ" -> "New Jersey",
  "NM" -> "New Mexico",
  "NY" -> "New York",
  "NC" -> "North Carolina",
  "ND" -> "North Dakota",
  "OH" -> "Ohio",
  "OK" -> "Oklahoma",
  "OR" -> "Oregon",
  "PA" -> "Pennsylvania",
  "RI" -> "Rhode Island",
  "SC" -> "South Carolina",
  "SD" -> "South Dakota",
  "TN" -> "Tennessee",
  "TX" -> "Texas",
  "UT" -> "Utah",
  "VT" -> "Vermont",
  "VA" -> "Virginia",
  "WA" -> "Washington",
  "WV" -> "West Virginia",
  "WI" -> "Wisconsin",
  "WY" -> "Wyoming"|>;
statesToCodes = Association[KeyValueMap[#2->#1&,codesToStates]];


(*countryDistancingPrecompute = Module[{
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
    ApplyWhere,
    googleMobility,
    dates,
    es,
    fr,
    it
  },

  googleMobility=parseCsv["https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv"];
  (*googleMobility=Select[googleMobility,AlphabeticOrder[#["date"],'2020-2-16']\[Equal]1&];*)
  
  dates=Prepend[QuantityMagnitude[DateDifference[DateObject[{2020,1,1}],DateObject[#["date"]]]]&/@Select[googleMobility,#["country_region_code"]=="IT"&&#["sub_region_1"]==""&],"State"];
  es=Prepend[Min[1,(1+(#["retail_and_recreation_percent_change_from_baseline"]+#["transit_stations_percent_change_from_baseline"]+#["workplaces_percent_change_from_baseline"])/300. )]&/@Select[googleMobility,#["country_region_code"]=="ES"&&#["sub_region_1"]==""&],"Spain"];
  it=Prepend[Min[1,(1+(#["retail_and_recreation_percent_change_from_baseline"]+#["transit_stations_percent_change_from_baseline"]+#["workplaces_percent_change_from_baseline"])/300. )]&/@Select[googleMobility,#["country_region_code"]=="IT"&&#["sub_region_1"]==""&],"Italy"];
  fr=Prepend[Min[1,(1+(#["retail_and_recreation_percent_change_from_baseline"]+#["transit_stations_percent_change_from_baseline"]+#["workplaces_percent_change_from_baseline"])/300. )]&/@Select[googleMobility,#["country_region_code"]=="FR"&&#["sub_region_1"]==""&],"France"];


  rawCsvTable = {dates,fr,es,it};

  dataDays = rawCsvTable[[1,2;;]];
  stateDistancings = rawCsvTable[[2;;,2;;]];
  stateLabels = rawCsvTable[[2;;,1]];
  countStates = Length[stateLabels];

  totalDays = tmax0;
  fullDays = Range[0, totalDays];

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
      ConstantArray[1., IntegerPart[Min[dataDays]]],
      (* historical distancing data *)
      distancing,
      (* for any gap between the last day of data and today, fill in with the average of the last three days of data *)
      ConstantArray[Mean[distancing[[-3;;]]], today - IntegerPart[Max[dataDays]]],
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
        ConstantArray[1., IntegerPart[Min[dataDays]]],
        smoothedDistancing,
        ConstantArray[Mean[smoothedDistancing[[-3;;]]], today - IntegerPart[Max[dataDays]]],
        ConstantArray[distancingLevel, scenario["distancingDays"]],
        ConstantArray[1., totalDays - scenario["distancingDays"] - today]
    }];

    distancingDelay = 5;
    Which[
      distancingDelay>0,
      smoothedFullDistancing=Join[ConstantArray[1,distancingDelay], smoothedFullDistancing[[;;-distancingDelay-1]]];,
      distancingDelay<0,
      smoothedFullDistancing=Join[smoothedFullDistancing[[distancingDelay+1;;]], ConstantArray[1,Abs[distancingDelay]]];
    ];

    distancingFunction = Interpolation[
      Transpose[{
          fullDays,
          smoothedFullDistancing}],
      InterpolationOrder->3];

    scenario["id"]-><|
      "distancingDays"->fullDays,
      "distancingLevel"->distancingLevel,
      "distancingData"->fullDistancing,
      "distancingFunction"->distancingFunction|>
  ];

  processState[state_,distancing_] := state->Association[
    Map[processScenario[#, distancing]&, scenarios]];

  Association[MapThread[processState, {stateLabels, stateDistancings}]]
];*)


(* grab state distancing data and return smoothed distancing functions for each scenario in the list of scenarios provided. *)
(* data from https://docs.google.com/spreadsheets/d/13woalkLKdCHG1x1jTzR3rrYiYOPlNAKyaLVChZgenu8/edit#gid=1922212346 *)
(* TODO: we need to be able to split this up into a scenario dependent part and a non-scenario dependent part for fitting parameters *)
usStateDistancingPrecompute = Module[{
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
    ApplyWhere,
    dates,
    stateDistancing,
    googleMobility,
    stateList
  },
  (* switch back to the google data when they start updating more regularly *)
  googleMobility=parseCsv["https://www.gstatic.com/covid19/mobility/Global_Mobility_Report.csv"];
  dates=Prepend[QuantityMagnitude[DateDifference[DateObject[{2020,1,1}],DateObject[#["date"]]]]&/@Select[googleMobility,#["country_region_code"]=="US"&&#["sub_region_1"]=="Virginia"&&#["sub_region_2"]==""&],"State"];

  stateDistancing[state_]:=Module[{stateName},
    stateName=codesToStates[state];
    Prepend[
      Map[
        Min[1,(1+(#["retail_and_recreation_percent_change_from_baseline"]+#["transit_stations_percent_change_from_baseline"]+#["workplaces_percent_change_from_baseline"])/300. )]&,
        Select[googleMobility,#["country_region_code"]=="US"&&#["sub_region_1"]==stateName&&#["sub_region_2"]==""&]],
      state]
  ];

  stateList = Map[
    statesToCodes[#]&,
    DeleteDuplicates[Map[
        #["sub_region_1"]&,
        Select[googleMobility,
          And[
            #["country_region_code"]=="US",
            #["sub_region_1"]!="",
            #["sub_region_2"]==""
          ]&]]]];
  rawCsvTable=Prepend[
    Map[stateDistancing, stateList],
    dates];

  dataDays = rawCsvTable[[1,2;;]];
  stateDistancings = rawCsvTable[[2;;,2;;]];
  stateLabels = rawCsvTable[[2;;,1]];
  countStates = Length[stateLabels];

  totalDays = tmax0;
  fullDays = Range[0, totalDays];

  smoothing = 7;
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
      ConstantArray[1., IntegerPart[Min[dataDays]]],
      (* historical distancing data *)
      distancing,
      (* for any gap between the last day of data and today, fill in with the average of the last three days of data *)
      ConstantArray[Mean[distancing[[-3;;]]], today - IntegerPart[Max[dataDays]]],
      (* moving average going forward in the scenario *)
      ConstantArray[distancingLevel, If[scenario["gradual"],twoWeeksFromNow-today,scenario["distancingDays"]]],
      (* gradual gets another array raising back to 1 *)
      If[scenario["gradual"], (1-distancingLevel)/(scenario["distancingDays"]-(twoWeeksFromNow-today)) Array[#&,scenario["distancingDays"]-(twoWeeksFromNow-today)]+distancingLevel,{}],
      (* post-policy distancing - constant at 1 *)
      ConstantArray[1.,
        totalDays - scenario["distancingDays"] - today]];

    smoothedDistancing = ApplyWhere[
      distancing,
      #<1&,
      GaussianFilter[#,smoothing]&];

    smoothedFullDistancing = SlowJoin[{
        ConstantArray[1., IntegerPart[Min[dataDays]]],
        smoothedDistancing,
        ConstantArray[Mean[smoothedDistancing[[-7;;]]], today - IntegerPart[Max[dataDays]]],
        ConstantArray[distancingLevel, If[scenario["gradual"],twoWeeksFromNow-today,scenario["distancingDays"]]],
        If[scenario["gradual"], (1-distancingLevel)/(scenario["distancingDays"]-(twoWeeksFromNow-today)) Array[#&,scenario["distancingDays"]-(twoWeeksFromNow-today)]+distancingLevel,{}],
        ConstantArray[1., totalDays - scenario["distancingDays"] - today]
    }];

    distancingDelay = 5;
    Which[
      distancingDelay>0,
      smoothedFullDistancing=Join[ConstantArray[1,distancingDelay], smoothedFullDistancing[[;;-distancingDelay-1]]];,
      distancingDelay<0,
      smoothedFullDistancing=Join[smoothedFullDistancing[[distancingDelay+1;;]], ConstantArray[1,Abs[distancingDelay]]];
    ];

    distancingFunction = Interpolation[
      Transpose[{
          fullDays,
          smoothedFullDistancing}],
      InterpolationOrder->3];

    scenario["id"]-><|
      "distancingDays"->fullDays,
      "distancingLevel"->distancingLevel,
      "distancingData"->fullDistancing,
      "distancingFunction"->distancingFunction,
      "mostRecentDistancingDay"->DateString[DatePlus[DateObject[{2020,1,1}], Last[dataDays]]]
    |>
  ];

  processState[state_,distancing_] := state->Association[
    Map[processScenario[#, distancing]&, scenarios]];

  Association[MapThread[processState, {stateLabels, stateDistancings}]]
];

(* for convenience we pre-compute the most recent day of distancing data to be rendered on the front end *)
mostRecentDistancingDay = usStateDistancingPrecompute["CA"]["scenario1"]["mostRecentDistancingDay"];


stateDistancingPrecompute = usStateDistancingPrecompute;


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


(* TODO:: re-incorporate to validate assumed parameters *)
countryParams[country_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_] :=
Module[{raw,pop,dist,buckets},
  raw = cachedAgeDistributionFor[country];
  pop = raw["Population"];
  dist = raw["Distribution"];
  buckets = raw["Buckets"];

  (*return a map of per state params to values *)
  <|
    "population"->pop,
    "importtime0"->countryImportTime[country],
    "ventilators"->countryVentilators[country],
    "pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pH"->Sum[infectedHospitalized[a]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
    "pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]
  |>
];
