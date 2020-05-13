(* ::Package:: *)

dateticks = {
  {0, Rotate["Jan",\[Pi]/2]},
  {(31),""},
  {(31+28),""},
  {(31+28+31),Rotate["Apr",\[Pi]/2]},
  {(31+28+31+30),""},
  {(31+28+31+30+31),""},
  {(31+28+31+30+31+30),Rotate["July",\[Pi]/2]},
  {(31+28+31+30+31+30+31),""},
  {(31+28+31+30+31+30+31+31),""},
  {(31+28+31+30+31+30+31+31+30),Rotate["Oct",\[Pi]/2]},
  {(31+28+31+30+31+30+31+31+30+31),""},
  {(31+28+31+30+31+30+31+31+30+31+30),""},
  {365,Rotate["Jan",\[Pi]/2]},{365+(31),""},
  {365+(31+28),""},
  {365+(31+28+31),Rotate["Apr",\[Pi]/2]},
  {365+(31+28+31+30),""},
  {365+(31+28+31+30+31),""},
  {365+(31+28+31+30+31+30),Rotate["July",\[Pi]/2]},
  {365+(31+28+31+30+31+30+31),""},
  {365+(31+28+31+30+31+30+31+31),""},
  {365+(31+28+31+30+31+30+31+31+30),Rotate["Oct",\[Pi]/2]},
  {365+(31+28+31+30+31+30+31+31+30+31),""},
  {365+(31+28+31+30+31+30+31+31+30+31+30),""},
  {365*2,Rotate["Jan",\[Pi]/2]},{365*2+(31),""},
  {365*2+(31+28),""},
  {365*2+(31+28+31),Rotate["Apr",\[Pi]/2]},
  {365*2+(31+28+31+30),""},
  {365*2+(31+28+31+30+31),""},
  {365*2+(31+28+31+30+31+30),Rotate["July",\[Pi]/2]},
  {365*2+(31+28+31+30+31+30+31),""},
  {365*2+(31+28+31+30+31+30+31+31),""},
  {365*2+(31+28+31+30+31+30+31+31+30),Rotate["Oct",\[Pi]/2]}};

containedText=Text[Framed[Style["Virus Contained",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Green,ContentPadding->False]];
containedGraphics=Graphics[containedText,ImageSize->Rasterize[containedText,"RasterSize"]];
heardText=Text[Framed[Style["Herd Immunity Developed",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Red,ContentPadding->False]];
heardGraphics=Graphics[heardText,ImageSize->Rasterize[heardText,"RasterSize"]];
icuBelowCapacity=Text[Framed[Style["ICU Below Capacity",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Green,ContentPadding->False]];
icuBelowCapacityGraphics=Graphics[icuBelowCapacity,ImageSize->Rasterize[icuBelowCapacity,"RasterSize"]];
icuOvershotText=Text[Framed[Style["ICU Capacity Overshot",FontSize->24,Bold,Black,FontFamily->"Calibri"],Background->Red,ContentPadding->False]];
icuOvershotTextGraphics=Graphics[icuOvershotText,ImageSize->Rasterize[icuOvershotText,"RasterSize"]];



fitPlots[state_, longData_, evaluateSolution_, fit_, fitParams_]:=Module[{deathDataLength},
deathDataLength=Length[Select[longData,#[[1]]==1&]];
Column[{
        Text["Fit for "<>state],
        Row[{
            Show[
              ListLogPlot[Cases[longData,{#, t_,c_}:>{t,c}]&/@{1,2},ImageSize->500,PlotRange->{{40,150},{0,Automatic}}],
              LogPlot[{
                  evaluateSolution[RepDeaq][Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["testingShift"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t],
                  evaluateSolution[PCR][
                    Log[fitParams["r0natural"]],
                    Log[fitParams["importtime"]],
                    Log[fitParams["testingShift"]],
                    Log[fitParams["stateAdjustmentForTestingDifferences"]],
                    Log[fitParams["distpow"]]
                  ][t]},
                {t,40,150},ImageSize->500]],
            ListPlot[{
                Thread[{#2,#1/#3}&[
                    fit["FitResiduals"][[1;;deathDataLength]],
                    (#[[2]]&/@longData[[1;;deathDataLength]]),
                    (#[[3]]&/@longData[[1;;deathDataLength]])
                ]],
                Thread[{#2,#1/#3}&[
                    fit["FitResiduals"][[deathDataLength+1;;Length[longData]]],
                    Reverse[(#[[2]]&/@longData[[deathDataLength+1;;Length[longData]]])],
                    Reverse[(#[[3]]&/@longData[[deathDataLength+1;;Length[longData]]])]
                ]]
              },ImageSize->500, Filling->Axis]
        }],
        Row[{fromLog@fit["ParameterTable"]//Quiet,fit["ANOVATable"]//Quiet}]
    }]
]
