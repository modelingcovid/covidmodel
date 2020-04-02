(* ::Package:: *)

rmsRelativeError[residuals_,longData_,mask_:{}]:=If[
	Length[mask]==0,
	Mean[(residuals/longData[[All,3]])^2]^.5,
	RmsRelativeError[
		Pick[residuals,mask],
		Pick[longData,mask]]];
meanRelativeError[residuals_,longData_,mask_:{}]:=If[
	Length[mask]==0,
	Mean[residuals/longData[[All,3]]],
	SystematicRelativeError[
		Pick[residuals,mask],
		Pick[longData,mask]]];
chiSquared[residuals_,longData_,mask_:{}]:=If[
	Length[mask]==0,
	Mean[residuals^2/longData[[All,3]]],
	RSquared[
		Pick[residuals,mask],
		Pick[longData,mask]]];
rSquared[residuals_,longData_,mask_:{}]:=If[
	Length[mask]==0,
	Total[residuals^2]/Total[(#-Mean[#])^2]&[longData[[All,3]]],
	RSquared[
		Pick[residuals,mask],
		Pick[longData,mask]]];


goodnessOfFitMetrics[residuals_,longData_]:=Module[{RmsRelativeError,MeanRelativeError,ChiSquared,RSquared,deathsMask,positivePcrMask},
	deathsMask=(#[[1]]==1)&/@longData;
	positivePcrMask=(#[[1]]==2)&/@longData;
	<|
		"chiSquared"->chiSquared[fit["FitResiduals"],longData],
		"rmsRelativeError"->rmsRelativeError[fit["FitResiduals"],longData],
		"rmsRelativeErrorDeaths"->rmsRelativeError[fit["FitResiduals"],longData,deathsMask],
		"rmsRelativeErrorPcr"->rmsRelativeError[fit["FitResiduals"],longData,positivePcrMask],
		"meanRelativeErrorDeaths"->meanRelativeError[fit["FitResiduals"],longData,deathsMask],
		"meanRelativeErrorPcr"->meanRelativeError[fit["FitResiduals"],longData,positivePcrMask],
		"rSquaredDeaths"->rSquared[fit["FitResiduals"],longData,deathsMask],
		"rSquaredPcr"->rSquared[fit["FitResiduals"],longData,positivePcrMask]
	|>
];


exportAllStatesGoodnessOfFitMetricsCsv[file_,allStateData_]:=Module[{columnOrder,gofAssociationToArray},
	columnOrder={"chiSquared",
		"rmsRelativeError",
		"rmsRelativeErrorDeaths",
		"rmsRelativeErrorPcr",
		"meanRelativeErrorDeaths",
		"meanRelativeErrorPcr",
		"rSquaredDeaths",
		"rSquaredPcr"};
	gofAssociationToArray[gofMetrics_]:=Map[gofMetrics[#]&,columnOrder];
	Export[
		file,
		Join[
			{Join[{"state"},columnOrder]},
			KeyValueMap[Join[#1,gofAssociationToArray[#2]]&,allStateData]],
		"CSV"];
]


exportAllStatesGoodnessOfFitMetricsSvg[file_,allStateData_]:=Module[{columnOrder,gofAssociationToArray},

]
