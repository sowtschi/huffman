/**
 * Copyright (c) 2019
 *
 * Dieses Skript dekodiert eine durch das Skript encode.js kodierten Text.
 * Der Text wird aus der Datei "encoded.txt" ausgelesen.
 * Die passenden Codes müssen sich in der Datei "codes.txt" befinden.
 * Der dekodierte Text wird in der Datei 'decoded.txt' gespeichert.
 *
 *
 * @summary Dieses Skript dekodiert eine durch das Skript encode.js kodierten Text.
 * @author Steffen Benjamin Owtschinnikow
 *
 * Created at     : 2019-05-04 14:32:44
 * Last modified  : 2019-05-05 17:00:48
 */


'use strict';

const fs = require('fs');

var codes='';
var text='';

try {
  text = fs.readFileSync('./encoded.txt', 'utf8');
  codes = fs.readFileSync('./codes.txt', 'utf8');
} catch (error) {
  console.log('Fehler beim einlesen des kodierten Texts oder der Code-Liste.');
  process.exit(1);
}

var letterCodes= [];
var letters=[];
var encodedPart='';
var decoded='';

parseCodes(codes);

decodeText();

try {
    fs.writeFileSync('./decoded.txt', decoded);
} catch (error) {
    console.log('Der dekodierte Text konnte nicht geschrieben werden.');
    process.exit(1);
}

console.log(decoded);

function decodeText() {
  for (var i=0; i<text.length; i++) {

    encodedPart = encodedPart + text.charAt(i);

    for (var j=0; j<letterCodes.length; j++) {

      if (letterCodes[j] === encodedPart) {

        decoded=decoded+letters[j];
        text.slice(encodedPart.length);
        encodedPart='';
      }
    }
  }
}

function parseCodes(codes) {

  var i=0;
  var code='';
  while (codes.length>0) {

    while (codes.charAt(i-1) !=';' && codes.charAt(i) != ';') {

      code=code+codes.charAt(i);

      i++;
    }

    codes = codes.slice(code.length+2);
    letterCodes.push(code);

    letters.push(codes.charAt(0));
    codes = codes.slice(3);

    code = '';
    i=0;

  }

}
