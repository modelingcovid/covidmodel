(* ::Package:: *)

measures=parseCsv["https://raw.githubusercontent.com/COVID19StatePolicy/SocialDistancing/master/data/USstatesCov19distancingpolicy.csv"];
getStateMeasures[state_]:=Module[{dateToDay, schoolsClosed, publicMask},
dateToDay[dateInteger_]:=QuantityMagnitude[DateDifference[DateObject[{2020,1,1}], DateObject[{
ToExpression[StringJoin[StringPart[ToString[dateInteger],1;;4;;1]]],
ToExpression[StringJoin[StringPart[ToString[dateInteger],5;;6;;1]]],
ToExpression[StringJoin[StringPart[ToString[dateInteger],7;;8;;1]]]
}]]];

schoolsClosed=If[Length[Select[measures,#["StatePostal"]==state&&#["StatePolicy"]=="SchoolClose"&]]>0,dateToDay[Select[measures,#["StatePostal"]==state&&#["StatePolicy"]=="SchoolClose"&][[1]]["DateIssued"]],Null];
publicMask=If[Length[Select[measures,#["StatePostal"]==state&&#["StatePolicy"]=="PublicMask"&]]>0,dateToDay[Select[measures,#["StatePostal"]==state&&#["StatePolicy"]=="PublicMask"&][[1]]["DateIssued"]],Null];



<|
    "schoolsClosed"->schoolsClosed,
"publicMask"->publicMask
|>
];
