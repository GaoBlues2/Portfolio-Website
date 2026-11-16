export const referenceCamera = {
  position: [8.2, 8.3, 14.2] as [number,number,number],
  target: [0.1, 1.35, 0.25] as [number,number,number],
  frameHeight: 7.4, near: 0.1, far: 80,
  // Inferred orthographic projection: azimuth 30°, elevation 23°.
}
export const lighting = {
  background:'#1c261f', exposure:1.05,
  ambient:0.5, hemisphere:0.8,
  key:{position:[-4,8,6] as [number,number,number],color:'#c6dcff',intensity:2.5},
  fill:{position:[5,4,-4] as [number,number,number],color:'#9db979',intensity:0.65},
  lamp:{position:[0.72,2.8,0.3] as [number,number,number],color:'#ffcf65',intensity:4,distance:2.8},
  bloom:{strength:0.12,radius:0.4,threshold:1.05},
}
export const colors = {
  turf:'#76aa22',turfBright:'#8bbb27',turfDark:'#547d1e',grass:'#8fc624',grassTip:'#b3d739',
  stone:'#52616b',stoneLight:'#6d7781',stoneDark:'#35454f',soil:'#66513b',soilLight:'#81644a',
  wood:'#a77a44',woodEdge:'#79532e',woodDark:'#503d29',wall:'#7c7d4f',sideWall:'#667a58',
  roof:'#3e4d60',roofLight:'#53637a',roofDark:'#2a3543',
  black:'#11191e',rubber:'#202b30',steel:'#3a454c',lime:'#b5f735',
  leaf:'#4d8035',leafLight:'#638e40',leafDark:'#315e29',
  hoodie:'#404975',hoodieLight:'#505c88',pants:'#222e46',skin:'#c89265',shoe:'#694c45',sole:'#b9b6b3',
  path:'#aaa698',pathLight:'#beb8a8',water:'#318eae',foam:'#c0f4ff',cloud:'#7c9ca9',
}

// Shared placement keeps the contact island and its animated frog together.
export const contactRightOffset: [number, number, number] = [.42, .42, 0]
