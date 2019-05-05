/**
 * Copyright (c) 2019
 *
 * Dieses Skript kodiert einen beliebigen Text nach David Huffman's Methode.
 * Der einzulesende Text muss als Parameter beim Skriptaufruf übergeben werden.
 * Die einzelnen Zeichen werden in der Variable "letters" gespeichert.
 * Die Anzahl der Vorkommnisse eines Zeichens werden in der Variable "frequencys" gespeichert.
 * Nach dem Durchlauf wird der kodierte Text in der Datei "encoded.txt" gespeichert.
 * Die passenden Codes zur Wiederherstellung der Nachricht werden in der Datei "codes.txt" gespeichert.
 *
 * @summary Dieses Skript kodiert einen beliebigen Text nach David Huffman's Methode.
 * @author Steffen Benjamin Owtschinnikow
 *
 * Created at     : 2019-05-01 18:21:56
 * Last modified  : 2019-05-05 16:31:40
 */

'use strict';

const file=process.argv[2];

if (file == '' || file == undefined) {
  console.log('Bitte die einzulesende Datei als Parameter angeben.');
  process.exit(1);
}

const fs = require('fs');

var content = '';

try {
    content = fs.readFileSync(file, 'utf8');
} catch (error) {
    console.log('Datei zum Kodieren konnte nicht eingelesen werden.');
    process.exit(1);
}

if (content === '') {
    console.log('Die einzulesende Datei ist leer.');
    process.exit(1);
}

var letters = findAllLetters(content);

var frequencys = countLettersFrequency(content, letters);

var letter = createLetter(letters, frequencys);

var sortedLetters = sortLetterObjects(letter);

console.log(sortedLetters);

var clonedLetters = sortedLetters.slice(0);

var tree = [];

if (sortedLetters.length < 2 || sortedLetters.length == undefined) {
    console.log('Der zu kodierende Text enhält weniger als zwei unterschiedliche Zeichen.');
    process.exit(1);
}

if (sortedLetters.length == 2) {

    tree.push(mergeNotes(sortedLetters[0], sortedLetters[1]));
} else {

    tree = createTree(sortedLetters);
}

var codes = createCodesForLetters(tree, clonedLetters);

console.log(codes);

var text = encodeText(content, codes, clonedLetters);

console.log(text);

try {
    fs.writeFileSync('./encoded.txt', text);
} catch (error) {
    console.log('Der Kodierte Text konnte nicht geschrieben werden.');
    process.exit(1);
}


var codesText = '';

for (var i = 0; i < codes.length; i++) {
    codesText = codesText + codes[i] + ';;' + clonedLetters[i].letter + ';;';
}

try {
    fs.writeFileSync('./codes.txt', codesText);
} catch (error) {
    console.log('Fehler beim Schreiben der Codes.');
    process.exit(1);
}


function encodeText(content, codes, sortedLetters) {
    var code = '';

    for (var i = 0; content.length > i; i++) {

        for (var j = 0; sortedLetters.length > j; j++) {
            if (content.charAt(i) === sortedLetters[j].letter) {

                code = code + codes[j];
            }
        }
    }

    return code;
}

function createCodesForLetters(tree, letter) {
    var codes = [];

    for (var j = 0; j < letter.length; j++) {

        var code = '';

        for (var i = 0; i < tree.length; i++) {

            if (tree[i].left == letter[j].letter) {
                code = code + '1';
            }
            if (tree[i].right == letter[j].letter) {
                code = code + '0';
            }
            if (tree[i].left.includes(letter[j].letter)) {
                code = code + '1';
            }
            if (tree[i].right.includes(letter[j].letter)) {
                code = code + '0';
            }
        }

        codes.push(code.split("").reverse().join(""));
        code = '';
    }

    return codes;
}

function createTree(sortedLetters) {

    var openNotes = [];
    var finishedNotes = [];
    var noteNumber = 0;

    var lowestOpenNote = findLowestOpenNote(openNotes);
    var secondLowestOpenNote = findSecondLowestOpenNote(openNotes, lowestOpenNote);

    while (sortedLetters.length > 0 || (lowestOpenNote != -1 && secondLowestOpenNote != -1)) {

        var mixedCount = -1;
        var sortedCount = -1;
        var openCount = -1;

        var sortedLetters1 = sortedLetters[0];
        var sortedLetters2 = sortedLetters[1];

        if (sortedLetters.length > 0 && lowestOpenNote != -1)
            mixedCount = sortedLetters1.frequency + openNotes[lowestOpenNote].frequency;
        if (sortedLetters.length > 2)
            sortedCount = sortedLetters1.frequency + sortedLetters2.frequency;
        if (lowestOpenNote != -1 && secondLowestOpenNote != -1)
            openCount = openNotes[lowestOpenNote].frequency + openNotes[secondLowestOpenNote].frequency;

        switch (findLowestCombination(mixedCount, sortedCount, openCount)) {

            case 'm':

                var lOpenNote = createNote(openNotes[lowestOpenNote]);

                openNotes.push(mergeNotes(sortedLetters[0], lOpenNote));
                sortedLetters.splice(0, 1);
                openNotes[lowestOpenNote].finished = true;
                break;

            case 'o':

                var lOpenNote = createNote(openNotes[lowestOpenNote]);
                var slOpenNote = createNote(openNotes[secondLowestOpenNote]);

                openNotes.push(mergeNotes(lOpenNote, slOpenNote));
                openNotes[lowestOpenNote].finished = true;
                openNotes[secondLowestOpenNote].finished = true;
                break;

            case 's':
                openNotes.push(mergeNotes(sortedLetters[0], sortedLetters[1]));
                sortedLetters.splice(0, 2);
                break;
            case 'e':
                console.log('Die eingegebenen Daten können nicht verarbeitet werden.');
                process.exit(1);
        }

        lowestOpenNote = findLowestOpenNote(openNotes);
        secondLowestOpenNote = findSecondLowestOpenNote(openNotes, lowestOpenNote);

    }

    return openNotes;
}

function createNote(note) {
    return {
        letter: note.left + note.right,
        frequency: note.frequency
    }

}

function findLowestCombination(mixed, sorted, open) {

    if (((open <= mixed && open < sorted) ||
            (open <= mixed && sorted == -1) ||
            (open < sorted && mixed == -1) ||
            mixed == -1 && sorted == -1) && open != -1) {
        return 'o';
    }

    if (((mixed < open && mixed < sorted) ||
            (mixed < open && sorted == -1) ||
            (mixed < sorted && open == -1) ||
            open == -1 && sorted == -1) && mixed != -1) {
        return 'm';
    }

    if (((sorted <= mixed && sorted <= open) ||
            (sorted <= mixed && open == -1) ||
            (sorted <= open && mixed == -1) ||
            mixed == -1 && open == -1) && sorted != -1) {
        return 's';
    }

    if (sorted == -1 && mixed == -1 && open == -1) {
        throw new Error('Something went wrong');
        return 'e';
    }
}

function findSecondLowestOpenNote(openNotes, lowestOpenNote) {

    var lowestI = -1;

    for (var i = 0; i < openNotes.length; i++) {
        if (!openNotes[i].finished && i != lowestOpenNote) {

            if (openNotes[i].frequency < openNotes[lowestI] || lowestI == -1) {

                var lowestNote = openNotes[i];
                lowestI = i;
            }
        }
    }

    return lowestI;
}

function findLowestOpenNote(openNotes) {

    var lowestI = -1;

    for (var i = 0; i < openNotes.length; i++) {

        if (!openNotes[i].finished) {

            var lowestNote = openNotes[i];
            lowestI = i;

            for (var i = 0; i < openNotes.length; i++) {

                if (openNotes[i].frequency < lowestNote.frequency && !openNotes[i].finished) {

                    lowestI = i;
                    lowestNote = openNotes;
                }

            }

            break;
        }
    }

    return lowestI;
}

function mergeNotes(note1, note2) {

    var note = {
        left: note1.letter,
        right: note2.letter,
        frequency: note1.frequency + note2.frequency,
        finished: false
    }

    return note;
}

function sortLetterObjects(letterObjects) {

    var lowestTemp = letterObjects[0].frequency + 1;
    var lowestIndex = 0;
    var sortedLetterObjects = [];

    var numberOfElements = letterObjects.length;

    while (sortedLetterObjects.length < numberOfElements) {

        lowestTemp = letterObjects[0].frequency + 1;

        for (var i = 0; i < letterObjects.length; i++) {

            if (letterObjects[i].frequency < lowestTemp) {
                lowestTemp = letterObjects[i].frequency;
                lowestIndex = i;
            }
        }

        sortedLetterObjects.push(letterObjects[lowestIndex])
        letterObjects.splice(lowestIndex, 1);
    }

    return sortedLetterObjects;
}

function createLetter(letter, frequencys) {

    var letters = [];

    for (var i = 0; i < frequencys.length; i++) {

        var letterObject = {
            letter: letter[i],
            frequency: frequencys[i]
        }

        letters.push(letterObject);
    }

    return letters;
}

function findAllLetters(content) {
    var letters = [];

    for (var i = 0; i < content.length; i++) {
        if (!letters.includes(content.charAt(i)) && content.charAt(i)) {
            letters.push(content.charAt(i));
        }
    }

    return letters;
}

function countLettersFrequency(content, letters) {

    var frequencys = [];
    var frequency = 0;

    for (var i = 0; i < letters.length; i++) {

        for (var j = 0; j < content.length; j++) {

            if (content.charAt(j) == letters[i]) {

                frequency++;
            }
        }

        frequencys.push(frequency);
        frequency = 0;
    }

    return frequencys;
}
