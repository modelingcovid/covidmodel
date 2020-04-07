(* ::Package:: *)

Autoindent[file_]:=Module[{
    openers,
    closers,
    rawText,
    comments,
    removeComments,
    insertComments,
    strings,
    removeStrings,
    insertStrings,
    lines,
    openCount,
    closeCount,
    closeAtStart,
    indents},
  rawText=Import[file,"Text"];

  comments=StringCases[rawText,RegularExpression["\\(\\*+([^*)]|\\*[^)]|[^*]\\))*\\*+\\)"]];
  removeComments=MapIndexed[#1->"<<<<comment"<>ToString[First[#2]]<>">>>>"&,comments];
  insertComments=MapIndexed["<<<<comment"<>ToString[First[#2]]<>">>>>"->#1&,comments];
  rawText = StringReplace[rawText,removeComments];

  strings=StringCases[rawText,RegularExpression["\"([^\"\\\\]|\\\\.)*\""]];
  removeStrings=MapIndexed[#1->"<<<<string"<>ToString[First[#2]]<>">>>>"&,strings];
  insertStrings=MapIndexed["<<<<string"<>ToString[First[#2]]<>">>>>"->#1&,strings];
  rawText = StringReplace[rawText,removeStrings];

  lines=Map[StringTrim,StringSplit[rawText,EndOfLine]];

  openers={"(","[","{","<|","\[LeftDoubleBracket]"};
  closers={")","]","}","|>","\[RightDoubleBracket]"};
  openCount=StringCount[lines,openers];

  closeCount=StringCount[lines,closers];
  closeAtStart=Map[StringCount[StringReplace[#,Whitespace->""],StartOfString~~closers..]&,lines];
  indents=Join[{0},Accumulate[openCount-closeCount][[;;-2]]]-closeAtStart ;

  rawText=StringJoin[MapThread[StringJoin[ConstantArray["  ", If[StringLength[#2]>0,#1,0]],#2,"\n"]&,{indents,lines}]];
  rawText=StringReplace[StringReplace[rawText,insertStrings],insertComments];
  Export[file,rawText,"Text"];
];
