(* ::Package:: *)

(** Model parameters. See https://docs.google.com/spreadsheets/d/1DH58EFf_YkWHa_zn8-onBGzsYFMamjSjOItr137vu9g/edit#gid=0 **)
SetDirectory[$UserDocumentsDirectory<>"/Github/covidmodel"]

Import["model/data.wl"];
Import["model/plot-utils.wl"];

(*Rate of progressing to infectiousness, days*)
daysFromInfectedToInfectious0 = 2.8;

(*Rate of losing infectiousness or going to the hospital, weeks*)
daysUntilNotInfectiousOrHospitalized0 = 2.5;

(*Rate of leaving hospital for those not going to critical care, weeks*)
daysToLeaveHosptialNonCritical0 = 8;

(*Rate of leaving hospital and going to critical care, weeks*)
daysTogoToCriticalCare0 = 6;

(*Rate of leaving critical care, weeks*)
daysFromCriticalToRecoveredOrDeceased0 = 6;

pPCRH0 = 0.8;
pPCRNH0 = 0.08;

(* How out of date are reports of hospitalizations? *)
daysForHospitalsToReportCases0 = 2;

daysToGetTestedIfNotHospitalized0 = 5.5;
daysToGetTestedIfHospitalized0 = 1.5;
 
(* virus start parameters *)
initialInfectionImpulse0 = 12.5;

(*Duration of pulse in force of infection for establishment, days*)
importlength0 = 3;

(*Establishment time, N days before X Cases*)
importtime0 = (31+20);

(* mitigation parameters *)
r0natural0 = 3.1;

(*Fraction of critical patents who pass *)
fractionOfCriticalDeceased0 = 0.3;

USAPopulation = (327.2*10^6);

(* less than 100 cases in a country the size of the US *)
containmentThresholdRatio0 = 100/USAPopulation;

(* model predict max *)
tmax = 5*365;

(* interpret as: steepness of age depencence*)
medianHospitalizationAge0 = 65;

(* interpret as: steepness of age depencence*)
ageCriticalDependence0 = 3;

ageHospitalizedDependence0 = 5;

pHospitalized100Yo = 0.25;

(*Probability of needing critical care*)
pCriticalGivenHospitalized100Yo = 0.3;

(*Probability of hospitalization but not critical care*)
pC0 = pCriticalGivenHospitalized100Yo*pHospitalized100Yo;

(*Probability of not needing care*)
pH0 = (1-pCriticalGivenHospitalized100Yo)*pHospitalized100Yo;

pS0 = 1-(pC0 + pH0);

(** Utils **)

dataFile[name_] := $UserDocumentsDirectory <> "/Github/covidmodel/model/data/" <> name;
      
today=QuantityMagnitude[DateDifference[DateList[{2020,1,1}],Today]];

CovidModel[
r0natural_,
daysUntilNotInfectiousOrHospitalized_,
daysFromInfectedToInfectious_,
daysUntilNotInfectiousOrHospitalized_,
daysToLeaveHosptialNonCritical_,
pPCRNH_,
pPCRH_,
daysTogoToCriticalCare_,
daysFromCriticalToRecoveredOrDeceased_,
fractionOfCriticalDeceased_,
importtime_,
importlength_,
initialInfectionImpulse_,
tmax_,
pS_,
pH_,
pC_,
containmentThresholdCases_,
icuCapacity_,
distancing_,
hospitalCapacity_:1000000 (*defaulted since we dont evaluate this on a country basis yet *)
]:=
Reap[NDSolve[{
	
	Sq'[t]    == (-distancing[t] *
			 	  r0natural *
				  Iq[t] *
				  Sq[t]) / daysUntilNotInfectiousOrHospitalized
	 			 - est[t] * Sq[t],
	
	Eq'[t]    == (distancing[t] *
			 	  r0natural *
				  Iq[t] *
				  Sq[t]) / daysUntilNotInfectiousOrHospitalized
				 + est[t] * Sq[t] 
				 - Eq[t] / daysFromInfectedToInfectious,
	
	(* Infectious total, not yet PCR confirmed, age indep *)
	Iq[t]     == ISq[t] + IHq[t] + ICq[t],
	
	(* Infected without needing care *)
	ISq'[t]   == pS*Eq[t]/daysFromInfectedToInfectious - ISq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Recovered without needing care *)
	RSq'[t]   == ISq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Infected and will need hospital, won't need critical care *)	
	IHq'[t]   == pH*Eq[t]/daysFromInfectedToInfectious - IHq[t]/daysUntilNotInfectiousOrHospitalized,

	(* Going to hospital *) 
	HHq'[t]   == IHq[t]/daysUntilNotInfectiousOrHospitalized - HHq[t]/daysToLeaveHosptialNonCritical,
	
	(* Reported positive hospital cases *)
	RepHq'[t] == (pPCRH * HHq'[t]) / daysForHospitalsToReportCases0,

	(* Cumulative hospitalized count *)	
	EHq'[t]   == IHq[t]/daysUntilNotInfectiousOrHospitalized,

	(* Recovered after hospitalization *)	
	RHq'[t]   == HHq[t]/daysToLeaveHosptialNonCritical,

	(* pcr confirmation *)	
	PCR'[t]   == (pPCRNH*Iq[t])/daysToGetTestedIfNotHospitalized0 + (pPCRH*HHq[t])/daysToGetTestedIfHospitalized0,

	(* Infected, will need critical care *)	
	ICq'[t]   == pC*Eq[t]/daysFromInfectedToInfectious - ICq[t]/daysUntilNotInfectiousOrHospitalized,
	
	(* Hospitalized, need critical care *)
	HCq'[t]   == ICq[t]/daysUntilNotInfectiousOrHospitalized - HCq[t]/daysTogoToCriticalCare,

	(* Entering critical care *)	
	CCq'[t]   == HCq[t]/daysTogoToCriticalCare - CCq[t]/daysFromCriticalToRecoveredOrDeceased,
	
	(* Dying *)
	Deaq'[t]  == CCq[t]*If[CCq[t]>=icuCapacity,2*fractionOfCriticalDeceased,fractionOfCriticalDeceased]/daysFromCriticalToRecoveredOrDeceased,
	
	(* Leaving critical care *)
	RCq'[t]   == CCq[t]*(1-fractionOfCriticalDeceased)/daysFromCriticalToRecoveredOrDeceased,
	
	est'[t]   == 0,

	WhenEvent[Iq[t]<=containmentThresholdCases&&PCR[t]<=0.1,Sow[{t,Iq[t]},"containment"]], (* when the virus is contained without herd immunity extract the time *)
	WhenEvent[CCq[t]>=icuCapacity,Sow[{t,CCq[t]},"icu"]], (* ICU Capacity overshot *)
	WhenEvent[HHq[t]>=hospitalCapacity,Sow[{t,HHq[t]},"hospital"]],(* Hospitals Capacity overshot *)
	WhenEvent[t>=importtime , est[t]->Exp[-initialInfectionImpulse]], 
	WhenEvent[t >importtime+importlength, est[t]->0 ],
	Sq[0] ==1, Eq[0]==0,ISq[0]==0,RSq[0]==0,IHq[0]==0,
	HHq[0]==0,RepHq[0]==0,RHq[0]==0,ICq[0]==0,HCq[0]==0,CCq[0]==0,RCq[0]==0,Deaq[0]==0,est[0]==0,PCR[0]==0,
	EHq[0]==0
	},{Sq, Eq, ISq, RSq, IHq, HHq, RHq, RepHq, Iq,ICq, EHq, HCq, CCq, RCq,Deaq,PCR,est},{t, 0, tmax}
],{"containment","icu","hospital"},Rule];

infectedCritical[a_,medianHospitalizationAge_,pCLimit_,ageCriticalDependence_] := 
	pCLimit/(1+Exp[-((a-medianHospitalizationAge)/ageCriticalDependence)]);

infectedHospitalized[a_,medianHospitalizationAge_,pHLimit_,ageHospitalizedDependence_] :=
	pHLimit/(1+Exp[-((a-medianHospitalizationAge)/ageHospitalizedDependence)]);

noCare[a_,medianHospitalizationAge_,pCLimit_, pHLimit_,ageCriticalDependence_,ageHospitalizedDependence_] := 
	1-infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]-
	infectedHospitalized[a, medianHospitalizationAge,pHLimit, ageHospitalizedDependence];

nationalData = Append[#, "day" ->
					QuantityMagnitude[DateDifference[DateList[{2020,1,1}], DateList[#["date"] // ToString]]]] & /@
				URLExecute[URLBuild["https://covidtracking.com/api/us/daily"],"RawJSON"];

countryData = Association[{"United States"->nationalData,"France"->franceData,"Spain"->spainData,"Italy"->italyData}];

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

countryVentilators = Association[{"United States"->61929,"France"->5000,"Italy"->3000,"Spain"->2000}];

countryImportTime=Association[{"United States"->62,"France"->55,"Italy"->45,"Spain"->53}];

countryParams[country_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_] := 
	Module[{raw,pop,dist,buckets},
		raw = cachedAgeDistributionFor[country];
		pop = raw["Population"];
		dist = raw["Distribution"];
		buckets = raw["Buckets"];

(*return a map of per state params to values *)
<|"Population"->pop,
"importtime0"->countryImportTime[country],
"ventilators"->countryVentilators[country],
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];

countryHistoricalDistancing[country_,t_]:=Association[{"Italy"->{{1,t<58},{0.8,58<=t<68},{0.5,68<=t<75},{0.3,68<=t<200},{1,200<=t<=tmax}},"France"->{{1,t<64},{0.8,64<=t<74},{0.35,74<=t<81},{0.35,81<=t<200},{1,200<=t<=tmax}},"Spain"->{{1,t<73},{0.6,74<=t<=81},{0.4,81<=t<200},{1,200<=t<=tmax}},"United States"->{{1,t<85},{0.8,85<=t<85+14},{0.4,85+14<=t<200},{1,200<=t<=tmax}}}][country];

stateData = URLExecute[URLBuild["https://covidtracking.com/api/states/daily"],"RawJSON"];
parsedData = Append[#,"day"->QuantityMagnitude[DateDifference[DateList[{2020,1,1}],DateList[#["date"]//ToString]]]]&/@stateData;
statesWith50CasesAnd5Deaths = DeleteDuplicates[#["state"]&/@Select[parsedData,(#["positive"]>=50&&#["death"]>=5)&]];
stateRawDemographicData = Association[(#->cachedAgeDistributionFor[#])&/@statesWith50CasesAnd5Deaths];
stateImportTime = Association[{"NY"->56,"AZ"->63,"CA"->56,"CO"->55,"CT"->57,"FL"->56,"GA"->52,"IL"->58,"IN"->58,"MA"->58, "MI"->59,"NJ"->56,"NV"->58,"OH"->61,"PA"->62,"SC"->59,"TX"->61,"VA"->58,"VT"->54,"WA"->41,"WI"->60,"LA"->51,"OR"->55}];

icuRawData=Import["model/data/icu-beds.csv","CSV"];
icuHeader=icuRawData[[1]];
icuBody=icuRawData[[2;;]];
icuParsedData=Thread[icuHeader->#]&/@icuBody//Map[Association];
stateICURawData=GroupBy[icuParsedData,#["HQ_STATE"]&];
stateICUData=<|"icuBeds"->Sum[If[#[[i]]["NUM_ICU_BEDS"] == "",0,#[[i]]["NUM_ICU_BEDS"]],{i,1,Length[#]}],
"staffedBeds"->Sum[If[#[[i]]["NUM_STAFFED_BEDS"] == "",0,#[[i]]["NUM_STAFFED_BEDS"]],{i,1,Length[#]}],
"bedUtilization"->Sum[If[#[[i]]["BED_UTILIZATION"] == "",0,#[[i]]["BED_UTILIZATION"]],{i,1,Length[#]}]/Sum[If[#[[i]]["BED_UTILIZATION"] == "",0,1],{i,1,Length[#]}]
|>&/@stateICURawData; //Quiet

hospitalizationsRawData=Import["model/data/hospitalized.csv"];
hospitalizationsHeader=hospitalizationsRawData[[1]];
hospitalizationsBody=hospitalizationsRawData[[2;;]];
hospitalizationsParsedData=Thread[hospitalizationsHeader->#]&/@hospitalizationsBody//Map[Association];
stateHospitalizationData[state_]:=Select[Association[{"day"->#["State"], "hospitalizations"->If[#[state]=="",0,#[state]]}]&/@hospitalizationsParsedData,#["hospitalizations"]>0&]

stateParams[state_, pCLimit_,pHLimit_,medianHospitalizationAge_,ageCriticalDependence_,ageHospitalizedDependence_]:=Module[{raw,pop,dist,buckets},
raw = stateRawDemographicData[state];
pop = raw["Population"];
dist = raw["Distribution"];
buckets = raw["Buckets"];

(*return a map of per state params to values *)
<|"Population"->pop,
"importtime0"->If[!KeyExistsQ[stateImportTime, state],Min[#["day"]&/@Select[parsedData,(#["state"]==state&&#["positive"]>=50)&]] - 20,stateImportTime[state]], (* importtime 20 days before 50 PCR confirmed reached *)
"ventilators"->ventilators[state],
"icuBeds"->stateICUData[state]["icuBeds"],
"staffedBeds"->stateICUData[state]["staffedBeds"],
"bedUtilization"->stateICUData[state]["bedUtilization"],
"R0"->Association[Select[stateDistancingData,#["state"]=="CA"&]]["baseline"]*r0natural0/100,
"pS"->Sum[noCare[a, medianHospitalizationAge, pCLimit,pHLimit,ageCriticalDependence,ageHospitalizedDependence ]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pH"->Sum[infectedHospitalized[a, medianHospitalizationAge, pHLimit,ageHospitalizedDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}],
"pC"->Sum[infectedCritical[a, medianHospitalizationAge, pCLimit,ageCriticalDependence]*dist[[Position[dist,a][[1]][[1]]]][[2]],{a,buckets}]|>
];

evaluateScenario[state_, scenario_]:=Module[{distance,t},
	params=stateParams[state,pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0];
	thisStateData=Select[parsedData,(#["state"]==state&&#["positive"]>0)&];
	icuCapacity=params["icuBeds"]/params["Population"];
	hospitalCapacity=(1-params["bedUtilization"])*params["staffedBeds"]/params["Population"];
	hospitalizationData = stateHospitalizationData[state];
	
	distance[t_]:=Piecewise[stateHistoricalDistancing[state,scenario,t],1];
	baseline=distance[1];
	
	{sol,evts}=CovidModel[
	r0natural0,
	daysUntilNotInfectiousOrHospitalized0,
	daysFromInfectedToInfectious0,
	daysUntilNotInfectiousOrHospitalized0,
	daysToLeaveHosptialNonCritical0,
	pPCRNH0,
	pPCRH0,
	daysTogoToCriticalCare0,
	daysFromCriticalToRecoveredOrDeceased0,
	fractionOfCriticalDeceased0,
	params["importtime0"],
	importlength0,
	initialInfectionImpulse0,
	tmax,
	params["pS"],
	params["pH"],
	params["pC"],
	containmentThresholdRatio0,
	icuCapacity,
	distance,
	hospitalCapacity
	];
	
	events=Association[Flatten[evts]];
	
	timeSeriesData=Table[Module[{},
	{

	"day"->t,
	"distancing"->(distance[t]/baseline),
	"confirmedDeaths"->If[Length[Select[thisStateData,(#["day"]==t)&]]!=1,0,Select[thisStateData,(#["day"]==t)&][[1]]["death"]],
	"confirmedPcr"->If[Length[Select[thisStateData,(#["day"]==t)&]]!=1,0,Select[thisStateData,(#["day"]==t)&][[1]]["positive"]],
	"confirmedHospitalizations"->If[Length[Select[hospitalizationData,(#["day"]==t)&]]!=1,0,Select[hospitalizationData,(#["day"]==t)&][[1]]["hospitalizations"]],
	
	"projectedPcr"->Evaluate[params["Population"]*(PCR[t])/.sol][[1]],
	"projectedDeaths"->Evaluate[params["Population"]*Deaq[t]/.sol][[1]],
	"projectedCurrentlyInfected"->Evaluate[params["Population"]*(Eq[t])/.sol][[1]],
	"projectedCurrentlyInfectious"->Evaluate[params["Population"]*(Iq[t])/.sol][[1]],
	"projectedCumulativeInfections"->Evaluate[params["Population"]*(RSq[t]+RHq[t]+RCq[t])/.sol][[1]],
	"projectedCurrentlyHospitalized"->Evaluate[params["Population"]*HHq[t]/.sol][[1]],
	"projectedCurrentlyCritical"->Evaluate[params["Population"]*CCq[t]/.sol][[1]]
	}],{t,0,300}];
	
	summary=<|
	"totalProjectedDeaths"->If[KeyExistsQ[events, "containment"],Evaluate[params["Population"]*Deaq[t]/.sol/.{t->events["containment"][[1]][[1]]}][[1]], Evaluate[params["Population"]*Deaq[t]/.sol/.{t->1000}][[1]]] ,"totalProjectedPCRConfirmed"->If[KeyExistsQ[events, "containment"],
	Evaluate[params["Population"]*PCR[t]/.sol][[1]]/.{t->events["containment"][[1]][[1]]},
	 Evaluate[params["Population"]*PCR[t]/.sol][[1]]/.{t->1000}],
	"totalProjectedInfected"->If[KeyExistsQ[events, "containment"],Evaluate[(RSq[t]+RHq[t]+RCq[t])/.sol][[1]]/.{t->events["containment"][[1]][[1]]},
	Evaluate[(RSq[t]+RHq[t]+RCq[t])/.sol][[1]]/.{t->1000}],
	"Fatality Rate"->If[KeyExistsQ[events, "containment"],Evaluate[(Deaq[t]/(RSq[t]+RHq[t]+RCq[t]))/.sol][[1]]/.{t->events["containment"][[1]][[1]]}, Evaluate[(Deaq[t]/(RSq[t]+RHq[t]+RCq[t]))/.sol][[1]]/.{t->1000}],
	"Fatality Rate (PCR)"->If[KeyExistsQ[events, "containment"],
	Evaluate[(Deaq[t]/PCR[t])/.sol][[1]]/.{t->events["containment"][[1]][[1]]}, 
	Evaluate[(Deaq[t]/PCR[t])/.sol][[1]]/.{t->1000}],
	"Date Contained"->If[KeyExistsQ[events, "containment"],
	DateString[DatePlus[{2020,1,1},events["containment"][[1]][[1]]-1]], 
	"Not Contained"],
	"Date ICU Over Capacity"->If[KeyExistsQ[events, "icu"]&&(!KeyExistsQ[events, "containment"]||(events["icu"][[1]][[1]]-events["containment"][[1]][[1]])<=0),DateString[DatePlus[{2020,1,1},events["icu"][[1]][[1]]-1]],"ICU Under capacity"],
	"Date Hospitals Over Capacity"->If[KeyExistsQ[events, "hospital"]&&(!KeyExistsQ[events, "containment"]||(events["hospital"][[1]][[1]]-events["containment"][[1]][[1]])<=0),DateString[DatePlus[{2020,1,1},events["hospital"][[1]][[1]]-1]],"Hospitals Under capacity"]|>;

	Association[{
	"timeSeriesData"->timeSeriesData,
	 "summary"->summary
	}]
];

scenarios={"scenario1","scenario2","scenario3","scenario4"};

(* evaluate state for all scenarios *)
evaluateState[state_]:=Merge[
{Association[{#->evaluateScenario[state,#]}]&/@scenarios,
stateParams[state, pC0,pH0,medianHospitalizationAge0,ageCriticalDependence0,ageHospitalizedDependence0]},
First
];

(* export the full model data *)
GenerateModelExport[] := Export["public/json/model.json",
	Association[{# -> evaluateState[#]} & /@ distancingStates]];

















