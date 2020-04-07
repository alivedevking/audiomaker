
# Audio Maker

**AudioMaker** is a javascript plugin which provides audio editing functionalites without using any other libraries like ffmpeg.

![npm](https://img.shields.io/npm/v/audiomaker) 
![GitHub](https://img.shields.io/github/license/alivedevking/audiomaker)
# Getting Started

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)


## Installation

```shell
npm install audiomaker
```

## Usage

```javascript
let audioMaker = require('audiomaker');

let _audioMaker = new audioMaker();
```

## Features

- **Input** - supports both `url` and `blob` inputs
- [Trim](#trim)
- [Add](#add)
- [Merge](#merge)
- [Loop](#loop)
- [Reverse](#reverse)
- [Multi-chaining](#multi-chaining)
- [Timeline](#timeline)

#### Demo
Try this demo for better understanding.
### Trim
> Method - trim(File, start, end);
```javascript
_audioMaker.trim('audio.mp3', 5, 9).then((blob)=>{
//   Output blob
});
```

### Add
> Method - add(Files[]);
```javascript
_audioMaker.add(['audio1.mp3', 'audio2.mp3', 'audio3.mp3']).then((blob)=>{
//   Output blob
});
```
### Merge
> Method - merge(Files[]);
```javascript
_audioMaker.merge(['audio1.mp3', 'audio2.mp3']).then((blob)=>{
//   Output blob
});
```
### Loop
> Method - loop(File, loopCount);
```javascript
_audioMaker.loop('audio.mp3', 2).then((blob)=>{
//   Output blob
});
```
### Reverse
> Method - reverse(File);
```javascript
_audioMaker.reverse('audio.mp3').then((blob)=>{
//   Output blob
});
```
### Multi-chaining

```javascript
_audioMaker.trim('audio.mp3', 5, 9).then((blob)=>{
   _audioMaker.loop(blob,3).then((result)=>{
    //   Output blob
   });
});
```

### Timeline
> Method - timeline(config[object]);
```javascript
let timelineConfig = [
  {
    audio: 'audio1.mp3',
    trim: [2,4],
    reverse: false,
    loop: 2
  },
  {
    audio: 'audio2.mp3',
    trim: [1,4],
    reverse: true,
    loop: 2
  },
  {
    audio: 'audio3.mp3',
    loop: 3
  }
];

_audioMaker.timeline(timelineConfig).then((blob)=>{
//   Output blob
});
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

- Licensed by **[MIT](https://github.com/alivedevking/audiomaker/blob/master/LICENSE.md)**.