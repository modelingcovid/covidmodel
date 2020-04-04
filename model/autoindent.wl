(* ::Package:: *)

Autoindent[file_]:=Module[{openers,closers,rawText,comments,removeComments,insertComments,lines,openCount,closeCount,closeAtStart,indents},
  openers={"[","{","<|",RegularExpression["{\($|\([^*]}"]};
  closers={"]","}","|>",RegularExpression["{^\)|[^*]\)}"]};
  
  rawText=Import[file,"Text"];
  comments=StringCases[rawText,RegularExpression["\\(\\*+([^*)]|\\*[^)]|[^*]\\))*\\*+\\)"]];
  removeComments=MapIndexed[#1->"<<<<"<>ToString[First[#2]]<>">>>>"&,comments];
  insertComments=MapIndexed["<<<<"<>ToString[First[#2]]<>">>>>"->#1&,comments];
  
  lines=Map[StringTrim,StringSplit[StringReplace[rawText,removeComments],EndOfLine]];
  
  openCount=StringCount[lines,openers];
  closeCount=StringCount[lines,closers];
  closeAtStart=Map[StringCount[StringReplace[#,Whitespace->""],StartOfString~~closers..]&,lines];
  indents=Join[{0},Accumulate[openCount-closeCount][[;;-2]]]-closeAtStart ;
  
  rawText=StringReplace[StringJoin[MapThread[StringJoin[ConstantArray["  ", #1],#2,"\n"]&,{indents,lines}]],insertComments];
  Export[file,rawText,"Text"];
];
