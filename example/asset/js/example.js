let _audioMaker = require('../../../');
let audioMaker = new _audioMaker();
let makeOutputElement = (elem,blob) => {
    let outputElem  = $('#'+elem)[0];
    outputElem.controls = true;
    outputElem.src = URL.createObjectURL(blob);
}
let trimAudio = () => {
    if($('#trimFile')[0].files[0]) {
        $('#trimError').text('');
        let file = $('#trimFile')[0].files[0];
        let trimStart = Number($('#trimStart').val());
        let trimEnd = Number($('#trimEnd').val());
        audioMaker.trim(file,trimStart,trimEnd).then((blob)=>{
            makeOutputElement('trimOutput',blob);
        });
    } else {
        $('#trimError').text('Need audio file to trim.');
    }
}

let concatAudio = () => {
    if($('#concatFile1')[0].files[0] && $('#concatFile2')[0].files[0]) {
        $('#concatError').text('');
        let file1 = $('#concatFile1')[0].files[0];
        let file2 = $('#concatFile2')[0].files[0];
        audioMaker.add([file1,file2]).then((blob)=>{
            makeOutputElement('concatOutput',blob);
        });
    } else {
        $('#concatError').text('Need audio file to concate.');
    }
}

let mergeAudio = () => {
    if($('#mergeFile1')[0].files[0] && $('#mergeFile2')[0].files[0]) {
        $('#mergeError').text('');
        let file1 = $('#mergeFile1')[0].files[0];
        let file2 = $('#mergeFile2')[0].files[0];
        audioMaker.merge([file1,file2]).then((blob)=>{
            makeOutputElement('mergeOutput',blob);
        });
    } else {
        $('#mergeError').text('Need audio file to merge.');
    }
}

let loopAudio = () => {
    if($('#loopFile')[0].files[0]) {
        $('#loopError').text('');
        let file = $('#loopFile')[0].files[0];
        let loopCount = Number($('#loopCount').val());
        audioMaker.loop(file,loopCount).then((blob)=>{
            makeOutputElement('loopOutput',blob);
        });
    } else {
        $('#loopError').text('Need audio file to loop.');
    }
}

let reverseAudio = () => {
    if($('#reverseFile')[0].files[0]) {
        $('#reverseError').text('');
        let file = $('#reverseFile')[0].files[0];
        audioMaker.reverse(file).then((blob)=>{
            makeOutputElement('reverseOutput',blob);
        });
    } else {
        $('#reverseError').text('Need audio file to reverse.');
    }
}

let timelineAudio = () => {
    let timelineArray = [];
    for(let i=1; i<4 ; i++) {
        let trimStart = Number($('#trimStart'+i).val());
        let trimEnd = Number($('#trimEnd'+i).val());
        let loopCount = Number($('#loopCount'+i).val());
        let config = {
            audio : `./asset/sounds/audio${i}.mp3`,
            trim : [trimStart,trimEnd],
            reverse : $('#isReverse'+i).prop("checked"),
            loop : loopCount
        }
        timelineArray.push(config);
    }
    audioMaker.timeline(timelineArray).then((blob)=>{
        makeOutputElement('timelineOutput',blob);
    });
}

