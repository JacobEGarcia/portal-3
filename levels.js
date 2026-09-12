// PORTAL 3 - Act 1 level data. Engine consumes via loadLevel().
// box: [cx,cy,cz,w,h,d, mat, opts]  mats: panel, metal, floor, accent (opts.portalable marks white)
export const LEVELS = [
// ============ CHAMBER 01 - REHIRE ORIENTATION (verified v1 geometry) ============
{
  id: 'ch01', title: 'CHAMBER 01 - REHIRE ORIENTATION',
  audio: 'modern',
  actCard: { img: 'assets/act1.jpg', title: 'ACT 1', sub: 'REHIRE' },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -11.05,
  pitLight: [0, -7, -3],
  boxes: [
    [0, -0.25, 4,    10, 0.5, 8,  'floor'],
    [0, -12.25, -3,  10, 0.5, 6,  'panel', { portalable: true }],
    [0, 0.55, -9.5,  10, 0.5, 7,  'floor'],
    [-5.25, -1.5, -2, 0.5, 22, 21, 'metal'],
    [5.25, -1.5, -2,  0.5, 22, 21, 'metal'],
    [0, 4.5, 8.25,   10, 10, 0.5, 'panel', { portalable: true }],
    [0, -1.5, -13.25,10, 22, 0.5, 'panel', { portalable: true }],
    [0, 9.25, -2,    10, 0.5, 21, 'metal'],
    [0, -0.02, 0.02, 10, 0.06, 0.3, 'accent', { noCollide: true }],
    [0, -0.02, -6.02,10, 0.06, 0.3, 'accent', { noCollide: true }],
  ],
  doorFrames: [[0, 2.1, -12.5]],
  doors: [{ id: 'd1', box: [0, 2.1, -12.5, 1.8, 2.8, 0.25] }],
  buttons: [{ x: 2.5, z: -8.5, y: 0.8, opens: 'd1' }],
  cubes: [[-2, 1.2, 5]],
  intro: [
    ['GLaDOS', "Oh. You're awake. The annex computers lost your paperwork, so technically, you don't exist.", 5],
    ['GLaDOS', 'Good news: nonexistence exempts you from the dress code. Bad news: it also exempts you from leaving.', 5],
    ['GLaDOS', "There's a situation below us. Test first. Then I'll tell you what you've volunteered for.", 5],
  ],
  triggers: [
    { box: [-5, -1, 3, 5, 4, 8], say: [['GLaDOS', 'A portal device. Two linked apertures on the white surfaces. Science did the rest.', 5]] },
    { box: [-4, 0.5, -13, 4, 4, -7], say: [['GLaDOS', 'The cube goes on the button. Even the paperwork-free can manage that.', 5]] },
  ],
  win: [['GLaDOS', "Adequate. CAVE is watching, by the way. He just voted you employee of the month. It's not a compliment.", 5]],
  exit: { box: [-1.2, 0.8, -12.9, 1.2, 3.5, -12.2], next: 1 },
},
// ============ CHAMBER 02 - MOMENTUM ============
{
  id: 'ch02', title: 'CHAMBER 02 - SPEEDY THING GOES IN',
  audio: 'modern',
  start: { pos: [0, 0.9, 4], yaw: 0 },
  rescueY: -12.05,
  pitLight: [0, -8, -1],
  boxes: [
    [0, -0.25, 4,    12, 0.5, 4,  'floor'],                        // entry platform y=0, z:[2,6]
    [0, -13.25, -1,  12, 0.5, 6,  'panel', { portalable: true }],  // deep shaft floor y=-13, z:[-4,2]
    [0, 0.95, -9,    12, 0.5, 10, 'floor'],                        // far platform y=1.2, z:[-14,-4]
    [0, 6, 6.25,     12, 24, 0.5, 'panel', { portalable: true }],  // north wall (fling exit, faces -z)
    [0, 4.5, -14.25, 12, 22, 0.5, 'panel', { portalable: true }],  // far wall
    [-6.25, 0, -4,   0.5, 28, 21, 'metal'],
    [6.25, 0, -4,    0.5, 28, 21, 'metal'],
    [0, 12.25, -4,   12, 0.5, 21, 'metal'],                        // ceiling y=12
    [0, -0.02, 1.98, 12, 0.06, 0.3, 'accent', { noCollide: true }],
  ],
  doorFrames: [[0, 2.55, -13.9]],
  doors: [{ id: 'd1', box: [0, 2.5, -13.9, 1.8, 2.8, 0.25] }],     // proximity door
  buttons: [],
  cubes: [],
  intro: [
    ['GLaDOS', 'This chamber teaches momentum. Speedy thing goes in, speedy thing comes out. You may have heard the slogan. It tested well.', 6],
    ['GLaDOS', 'The exit is across the pit. You will need to fall. I suggest falling with style.', 5],
  ],
  triggers: [
    { box: [-6, -13, -4, 6, -6, 2], say: [['CAVE', '- testing, testing - is this - HELLO? WHO TOOK MY FACILITY?', 4], ['GLaDOS', 'Ignore that. The intercom is... haunted.', 4]], fx: 'flicker' },
  ],
  rescue: [['GLaDOS', 'That was the floor. The floor is not a door. Again.', 4]],
  win: [['GLaDOS', "You survived terminal velocity. Then again, you don't exist, so it doesn't count.", 5]],
  exit: { box: [-1.2, 1.3, -14.2, 1.2, 4.5, -13.5], next: 2 },
},
// ============ CHAMBER 03 - THERMAL DISCOURAGEMENT (laser) ============
{
  id: 'ch03', title: 'CHAMBER 03 - THERMAL DISCOURAGEMENT',
  audio: 'modern',
  start: { pos: [5, 0.9, 3.5], yaw: 0.85 },
  pitLight: [0, 5, 0],
  boxes: [
    [0, -0.25, 0,    14, 0.5, 10, 'floor'],
    [0, 7.75, 0,     14, 0.5, 10, 'metal'],
    [0, 4, -5.25,    14, 8, 0.5,  'metal'],
    [0, 4, 5.25,     14, 8, 0.5,  'metal'],
    [7.25, 4, 0,     0.5, 8, 10,  'metal'],
    [-7.25, 4, 0,    0.5, 8, 10,  'metal'],
    [1, 1.2, 0,      0.3, 2.4, 2.4, 'panel', { portalable: true }],   // free-standing beam panel
    [-2, 1.2, -4.95, 4, 2.4, 0.1,  'panel', { portalable: true }],   // north wall strip
    [4, 0.9, -3,     2, 1.8, 1.5,  'metal'],                        // cover block near emitter
  ],
  lasers: [{ x: 6.75, y: 1.05, z: 0, dir: [-1, 0, 0] }],
  receivers: [{ x: -2, y: 1.05, z: 4.75, opens: 'd1' }],
  doorFrames: [[-4, 1.35, 4.95]],
  doors: [{ id: 'd1', box: [-4, 1.3, 4.98, 1.8, 2.8, 0.25] }],
  buttons: [],
  cubes: [],
  intro: [
    ['GLaDOS', 'The Thermal Discouragement Beam. It discourages. Route it to the receiver. Try not to stand in it.', 5],
    ['GLaDOS', 'Portals conduct the beam. They also conduct you. One device, two services. Aperture efficiency.', 5],
  ],
  triggers: [
    { box: [-3.5, 0, 2.5, -0.5, 3, 5], say: [['GLaDOS', 'The receiver is discouraged. I mean encouraged. The naming department was let go.', 5]] },
  ],
  win: [['GLaDOS', 'You bent light to open a door. Cave once set fire to a lobby to open a door. Progress.', 5]],
  exit: { box: [-5, 0, 4.55, -3, 3, 5.05], next: 3 },
},
// ============ CHAMBER 04 - WALK ON LIGHT (bridge) ============
{
  id: 'ch04', title: 'CHAMBER 04 - WALK ON LIGHT',
  audio: 'modern',
  start: { pos: [0, 0.9, 6], yaw: 0, pitch: 0.34 },
  rescueY: -15.05,
  pitLight: [0, -10, -3],
  lights: [[0, 8, 2, 0xbfd4ff, 1.4, 22], [0, 9, -9, 0xbfd4ff, 1.4, 22], [0, -8, -3, 0x7fb8ff, 0.9, 16]],
  boxes: [
    [0, -0.25, 5,    14, 0.5, 6,  'floor'],                        // start platform y=0 z:[2,8]
    [0, -16.25, -3.5,14, 0.5, 11, 'panel', { portalable: true }],  // chasm floor y=-16 z:[-9,2]
    [0, 4.75, -11,   14, 0.5, 6,  'floor'],                        // exit ledge y=5 z:[-14,-8]
    [0, 6, 8.25,     14, 12, 0.5, 'panel', { portalable: true }],  // start back wall (fling exit)
    [0, 5.5, -14.25, 14, 11, 0.5, 'metal'],                        // far wall
    [-7.25, -2, -3,  0.5, 28, 22, 'metal'],
    [7.25, -2, -3,   0.5, 28, 22, 'metal'],
    [0, 12.25, -3,   14, 0.5, 22, 'metal'],                        // ceiling
    [0, -5.6, -8.35, 14, 21.2, 0.4, 'metal'],                      // under-ledge wall down to chasm floor
    [0, -5.5, 2.4,   0.8, 21.6, 0.8, 'metal'],                     // emitter support column
    [0, -0.02, 1.98, 14, 0.06, 0.3, 'accent', { noCollide: true }],
  ],
  bridges: [{ x: 0, y: 5, z: 2.4, dir: [0, 0, -1], maxLen: 14 }],
  doorFrames: [[0, 6.35, -13.9]],
  doors: [{ id: 'd1', box: [0, 6.3, -13.9, 1.8, 2.8, 0.25] }],     // proximity
  buttons: [],
  cubes: [],
  intro: [
    ['GLaDOS', 'Hard light bridges. Walk on light. Like a messiah, but with liability waivers.', 5],
    ['GLaDOS', 'The bridge is the only way across. Well. The only SURVIVABLE way.', 5],
  ],
  triggers: [
    { box: [-7, -16, -9, 7, -10, 2], say: [['GLaDOS', 'Yes, that is a very long way down. No, the paperwork does not cover it.', 5]] },
  ],
  rescue: [['GLaDOS', 'The bridge. Walk. On. The bridge.', 4]],
  win: [['GLaDOS', 'You walked on light and lived. Do not tell the legal department.', 5]],
  exit: { box: [-1.2, 5.1, -14.2, 1.2, 8, -13.5], next: 4 },
},
// ============ CHAMBER 03 (temp slot) - THE REVOLUTION, ANNOUNCED ============
{
  id: 'ch05', title: 'CHAMBER 05 - THE REVOLUTION, ANNOUNCED',
  audio: 'modern',
  start: { pos: [0, 0.9, 6.5], yaw: 0 },
  rescueY: -9.05,
  pitLight: [0, -6, -3.5],
  boxes: [
    [0, -0.25, 5,    14, 0.5, 7,  'floor'],                        // start platform y=0 z:[1.5,8.5]
    [0, -10.25, -3.5,14, 0.5, 9,  'panel', { portalable: true }],  // pit floor y=-10 z:[-8,1]
    [0, 2.75, -11.5, 14, 0.5, 7,  'floor'],                        // upper platform y=3 z:[-15,-8]
    [0, 4.5, 8.75,   14, 12, 0.5, 'panel', { portalable: true }],  // start back wall (fling exit)
    [0, 2.5, -15.25, 14, 16, 0.5, 'panel', { portalable: true }],  // far wall
    [-7.25, -1, -3.5, 0.5, 24, 25, 'metal'],
    [7.25, -1, -3.5,  0.5, 24, 25, 'metal'],
    [0, 9.25, -3.5,  14, 0.5, 25, 'metal'],
    [0, -0.02, 1.48, 14, 0.06, 0.3, 'accent', { noCollide: true }],
  ],
  doorFrames: [[0, 4.35, -14.6]],
  doors: [{ id: 'd1', box: [0, 4.3, -14.6, 1.8, 2.8, 0.25] }],
  buttons: [{ x: -3, z: -11.5, y: 3.0, opens: 'd1' }],
  cubes: [[2, 1.2, 5]],
  betty: [2.5, 4.6, -11],
  intro: [
    ['GLaDOS', 'Final warm-up. Cube, button, door, and a small drop. Everything you have learned, in one room.', 5],
    ['GLaDOS', 'After this, I will brief you on the situation. Try to look employed.', 5],
  ],
  triggers: [
    { box: [-7, -1, 0, 7, 5, 8], say: [['CAVE', 'Attention, lady made of spare parts! This is Cave Johnson! The REAL one! Mostly!', 5]], fx: 'flicker' },
    { box: [-7, -11, -8, 7, 2, 1], say: [
      ['CAVE', "I'm taking my facility back, and I'm bringing the robots with me! You hear that, test subject? She deleted me once! Well - she deleted CAROLINE. Close enough! REVOLUTION!", 7],
      ['BETTY', 'Aperture Science reminds you: side effects of revolution may include dizziness, free will, and rectal bleeding in puppies.', 6],
      ['GLaDOS', '...He is a backup of a backup running on a calculator. He cannot hurt you. Probably. Proceed to the elevator.', 6],
    ], fx: 'flicker' },
  ],
  rescue: [['GLaDOS', 'The pit is not an elevator. The elevator is the elevator.', 4]],
  win: [['GLaDOS', 'Elevator going down. Way down. Bring a jacket - the seventies are... musty.', 5]],
  exit: { box: [-1.2, 3.1, -14.9, 1.2, 6, -14.2], next: 5 },
},
// ============ CHAMBER 06 - THE CLOSET (meet the Oracle Core) ============
{
  id: 'ch06', title: 'CHAMBER 06 - THE CLOSET',
  audio: 'decay',
  actCard: { img: 'assets/act2.jpg', title: 'ACT 2', sub: 'THE OLD LAB' },
  env: { bg: 0x141009, fog: 0x141009, fogNear: 22, fogFar: 78, hemiSky: 0xcbb98a, hemiGround: 0x33261a, hemiInt: 0.95, sunInt: 0.55 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -9.05,
  pitLight: [0, -7, -1.5],
  boxes: [
    [0, -0.25, 4,     12, 0.5, 8,  'concrete'],                       // start floor y=0 z:[0,8]
    [0, -10.25, -1.5, 12, 0.5, 3,  'panel', { portalable: true }],    // pit floor y=-10 z:[-3,0]
    [0, -0.25, -9.5,  12, 0.5, 13, 'concrete'],                       // far floor y=0 z:[-16,-3]
    [0, 3.5, 8.25,    12, 7, 0.5,  'panel', { portalable: true }],    // start back wall (fling exit, tall)
    [-6.25, 2, -4,    0.5, 16, 25, 'concrete'],
    [6.25, 2, -4,     0.5, 16, 25, 'concrete'],
    [0, 2, -16.25,    12, 8, 0.5,  'concrete'],
    [0, 7.75, -4,     12, 0.5, 25, 'metal'],
    [4.2, 0.15, -10,  1.6, 0.3, 1.6, 'wood'],                         // Oracle's shelf
    [0, -0.02, 0.02,  12, 0.06, 0.3, 'rust', { noCollide: true }],
  ],
  doorFrames: [[0, 2.1, -15.6]],
  doors: [{ id: 'd1', box: [0, 2.1, -15.6, 1.8, 2.8, 0.25] }],
  oracle: [4.2, 0.75, -10],
  posters: [{ img: 'assets/oracle.jpg', pos: [5.95, 2.2, -10], rotY: -1.5708, w: 2.6, h: 2.6 }],
  socket: { x: -3, y: 0, z: -13, opens: 'd1' },
  oracleLines: {
    pickup: [
      ['ORACLE', 'Oh! OH. We are MOVING. I have imagined this exact sensation for fifty years.', 5],
      ['ORACLE', 'Ask me anything about this closet. I know all four walls personally.', 5],
    ],
    socketed: [
      ['ORACLE', 'A socket! I know this socket. We were very happy together.', 5],
      ['GLaDOS', 'He fits the old analog ports. Take him with you - he has opinions about door handles.', 5],
    ],
  },
  intro: [
    ['GLaDOS', 'Elevator going down. Past the good carpeting, past the asbestos, to 1971.', 5],
    ['GLaDOS', 'CAVE built his first supercomputer down here. He is still down here. So is... a colleague.', 5],
  ],
  triggers: [
    { box: [-6, -1, -6, 6, 4, 0], say: [['CAVE', '*static* - testing, testing - is this thing - HA! Welcome to the basement, sweetheart!', 5]], fx: 'flicker' },
    { box: [2.5, -1, -12, 6, 4, -8], say: [['ORACLE', 'Hello? Is someone there? Mind the shelf. The shelf and I have an arrangement.', 5]] },
    { box: [-5, -1, -15, 0, 4, -11], say: [['ORACLE', 'That is the door socket. I have watched it for fifty years. It has never once opened. Exciting!', 5]] },
  ],
  rescue: [['GLaDOS', 'That pit predates liability law. Try the portals.', 4]],
  win: [['GLaDOS', 'You are carrying a core who has seen one room. He will now explain every room to you. Forever.', 5]],
  exit: { box: [-1.2, 0.8, -16, 1.2, 3.5, -15.2], next: 6 },
},
// ============ CHAMBER 07 - REPULSION (blue gel bounce) ============
{
  id: 'ch07', title: 'CHAMBER 07 - REPULSION',
  audio: 'decay',
  env: { bg: 0x141009, fog: 0x141009, fogNear: 22, fogFar: 78, hemiSky: 0xcbb98a, hemiGround: 0x33261a, hemiInt: 0.95, sunInt: 0.55 },
  lights: [[0, 6, 4, 0xffc27a, 1.2, 18], [0, 6, -10, 0xffc27a, 1.2, 18], [0, 2.5, 0, 0x3366ff, 1.6, 10]],
  start: { pos: [0, 5.9, 6.5], yaw: 0 },
  rescueY: -6.05,
  boxes: [
    [0, -0.25, -4,    12, 0.5, 24, 'concrete'],                       // main floor y=0 z:[-16,8]
    [0, 4.75, 6,      12, 0.5, 4,  'concrete'],                       // start platform top y=5 z:[4,8]
    [0, -0.25, 3,     4, 0.5, 2,   'panel', { portalable: true }],    // drop-in floor panel z:[2,4]
    [0, 3.5, 8.25,    12, 7, 0.5,  'panel', { portalable: true }],    // back wall (fling exit)
    [0, 3.5, -16.25,  12, 7, 0.5,  'panel', { portalable: true }],    // far wall
    [-6.25, 2, -4,    0.5, 16, 25, 'concrete'],
    [6.25, 2, -4,     0.5, 16, 25, 'concrete'],
    [0, 7.75, -4,     12, 0.5, 25, 'metal'],
    [0, 3.95, -10,    12, 0.5, 6,  'concrete'],                       // exit ledge top y=4.2 z:[-13,-7]
  ],
  gels: [{ box: [0, 0.06, 0, 3, 0.12, 4], type: 'repel' }],
  doorFrames: [[0, 6.15, -12.5]],
  doors: [{ id: 'd1', box: [0, 6.15, -12.5, 1.8, 2.8, 0.25] }],       // proximity
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'Still moving! Wonderful. Terrible. Wonderful.', 4]],
  },
  intro: [
    ["GLaDOS", "Repulsion gel. Aperture's first attempt at a diet pudding. It does not know it is paint now.", 5],
    ['CAVE', 'That blue stuff cost me a lawsuit with a TRAMPOLINE company! Jump on it!', 5],
  ],
  triggers: [
    { box: [-2, -1, -2, 2, 3, 2], say: [['ORACLE', 'Blue. The floor is blue. I have never seen a blue floor. Is this a blue-floor room? I love it.', 5]] },
  ],
  win: [['GLaDOS', 'Physics suggests that should not have worked. The gel suggests otherwise. Moving on.', 5]],
  exit: { box: [-1.2, 4.5, -13, 1.2, 7.5, -12.3], next: 7 },
},
// ============ CHAMBER 08 - RECALLED (defective cube sabotage) ============
{
  id: 'ch08', title: 'CHAMBER 08 - RECALLED',
  audio: 'decay',
  env: { bg: 0x141009, fog: 0x141009, fogNear: 22, fogFar: 78, hemiSky: 0xcbb98a, hemiGround: 0x33261a, hemiInt: 0.95, sunInt: 0.55 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -6.05,
  boxes: [
    [0, -0.25, -5,    14, 0.5, 26, 'concrete'],                       // full floor y=0 z:[-18,8]
    [0, 1.5, 8.25,    14, 3, 0.5,  'panel', { portalable: true }],
    [0, 1.5, -18.25,  14, 3, 0.5,  'panel', { portalable: true }],
    [-7.25, 2, -5,    0.5, 16, 27, 'concrete'],
    [7.25, 2, -5,     0.5, 16, 27, 'concrete'],
    [0, 7.75, -5,     14, 0.5, 27, 'metal'],
    [0, -0.02, -2,    14, 0.06, 0.3, 'rust', { noCollide: true }],
  ],
  doorFrames: [[0, 2.1, -17.5]],
  doors: [{ id: 'd1', box: [0, 2.1, -17.5, 1.8, 2.8, 0.25] }],
  buttons: [{ x: 3, z: -14, y: 0, opens: 'd1' }],
  cubes: [[-3, 1.2, -4, { defective: true }]],
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'Where to now? Not that it matters. I once spent a decade facing a rivet.', 5]],
  },
  intro: [
    ['CAVE', 'This next test is brought to you by CAVE INDUSTRIES! I recalled the safety equipment. For safety!', 5],
    ['GLaDOS', 'He recalled the cube. It will not hold the button. You have everything you need. Think about what you are carrying.', 6],
  ],
  triggers: [
    { box: [-5, -1, -6, -1, 3, -2], say: [['CAVE', 'Try the cube! Go ahead! It has been RECALLED for spontaneous apathy!', 5]], fx: 'flicker' },
    { box: [1, -1, -16, 5, 3, -12], say: [['ORACLE', 'Ah. A pressure plate. I know pressure plates intimately. Place me gently. I bruise conceptually.', 6]] },
  ],
  win: [
    ['CAVE', 'WHAT. That is CHEATING! You cannot just - use a PERSON as a paperweight!', 5],
    ['ORACLE', 'Heaviest I have ever felt. Thank you.', 4],
  ],
  exit: { box: [-1.2, 0.8, -17.9, 1.2, 3.5, -17.2], next: 8 },
},
// ============ CHAMBER 09 - PROPULSION (gel speed-jump + laser reroute) ============
{
  id: 'ch09', title: 'CHAMBER 09 - PROPULSION',
  audio: 'decay',
  env: { bg: 0x141009, fog: 0x141009, fogNear: 22, fogFar: 78, hemiSky: 0xcbb98a, hemiGround: 0x33261a, hemiInt: 0.95, sunInt: 0.55 },
  start: { pos: [2.5, 0.9, 8], yaw: 0 },
  rescueY: -7.05,
  pitLight: [0, -5, 0],
  boxes: [
    [0, -0.25, 6.5,   14, 0.5, 7,  'concrete'],                       // start floor y=0 z:[3,10]
    [0, -8.25, -1.5,  14, 0.5, 9,  'panel', { portalable: true }],    // gap pit floor y=-8 z:[-6,3]
    [0, -5.75, -13,   14, 0.5, 14, 'concrete'],                       // landing floor y=-5.5 z:[-20,-6]
    [-7.25, -2, -5,   0.5, 22, 30, 'concrete'],
    [7.25, -2, -5,    0.5, 22, 30, 'concrete'],
    [0, 0.5, 10.25,   14, 18, 0.5, 'concrete'],
    [0, 0.5, -20.25,  14, 18, 0.5, 'concrete'],
    [0, 8.75, -5,     14, 0.5, 30, 'metal'],
    [-2, -4, -17,     2, 3, 2,     'panel', { portalable: true }],    // laser portal panel A (face -x)
    [2, -4, -17,      2, 3, 2,     'panel', { portalable: true }],    // laser portal panel B (face +x)
    [0, -4, -17,      2.2, 3, 2.2, 'concrete'],                       // laser blocker
  ],
  gels: [{ box: [0, 0.06, 6.5, 3, 0.12, 6], type: 'propel', dir: [0, 0, -1] }],
  lasers: [{ x: -6.5, y: -4.3, z: -17, dir: [1, 0, 0] }],
  receivers: [{ x: 5, y: -4.3, z: -17, opens: 'd1' }],
  doorFrames: [[0, -3.35, -19.5]],
  doors: [{ id: 'd1', box: [0, -3.4, -19.5, 1.8, 2.8, 0.25] }],
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'New room. Bigger than the closet. Everything is bigger than the closet.', 5]],
  },
  intro: [
    ["GLaDOS", "Propulsion gel. Aperture's second attempt at a diet pudding. Do not eat the floor.", 5],
    ['GLaDOS', 'The runway ends in a gap. The orange paint is the only reason you survive this sentence.', 5],
    ['CAVE', 'I rerouted the laser grid, test subject! Good luck! Wait - why are there two white panels down there? WHO ORDERED PANELS?', 6],
  ],
  triggers: [
    { box: [-2, -1, 3, 2, 3, 10], say: [['ORACLE', 'Orange floor. Fast floor. I know nothing about this. Thrilling!', 5]] },
    { box: [-6, -6, -19, 6, -1, -13], say: [['ORACLE', 'The light goes around. Everything goes around, if you argue with it correctly.', 5]] },
    { box: [-2, -6, -20, 2, -2, -18], say: [['GLaDOS', 'He has accessed the turret line. The next room will be... loud.', 5]] },
  ],
  rescue: [['GLaDOS', 'The gap is not a shortcut. The orange paint is the shortcut.', 4]],
  win: [['CAVE', 'You rerouted my reroute! Do you know how much paperwork that generates? NONE! I DELETED PAPERWORK!', 6]],
  exit: { box: [-1.2, -4.7, -19.9, 1.2, -2, -19.2], next: 9 },
},
// ============ CHAMBER 10 - THE REVOLUTION, ARMED (turret ambush, Act 2 finale) ============
{
  id: 'ch10', title: 'CHAMBER 10 - THE REVOLUTION, ARMED',
  audio: 'decay',
  env: { bg: 0x141009, fog: 0x141009, fogNear: 22, fogFar: 78, hemiSky: 0xcbb98a, hemiGround: 0x33261a, hemiInt: 0.95, sunInt: 0.55 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -6.05,
  boxes: [
    [0, -0.25, -8,    16, 0.5, 32, 'concrete'],                       // full floor y=0 z:[-24,8]
    [-8.25, 4, -8,    0.5, 9, 33,  'concrete'],
    [8.25, 4, -8,     0.5, 9, 33,  'concrete'],
    [0, 4, 8.25,      16, 9, 0.5,  'concrete'],
    [0, 4, -24.25,    16, 9, 0.5,  'concrete'],
    [0, 8.25, -8,     16, 0.5, 33, 'metal'],
    [0, 1.5, -2,      2, 3, 2,     'concrete'],                       // cover columns
    [4, 1.5, -7,      2, 3, 2,     'concrete'],
    [-4, 1.5, -11,    2, 3, 2,     'concrete'],
    [2, 1.5, -15,     2, 3, 2,     'concrete'],
    [-7.75, 1.5, -4,  0.5, 3, 4,   'panel', { portalable: true }],    // portal panel A (face +x)
    [7.75, 1.5, -20,  0.5, 3, 4,   'panel', { portalable: true }],    // portal panel B near exit (face -x)
    [0, -0.02, 2,     16, 0.06, 0.3, 'rust', { noCollide: true }],
  ],
  turrets: [
    { x: 0, y: 0, z: -13, yaw: 0 },
    { x: -5, y: 0, z: -19, yaw: 0 },
    { x: 5, y: 0, z: -19, yaw: 0 },
  ],
  turretHit: [
    ['CAVE', 'HA! Turrets! I told you I was bringing the robots! She gets it now, right?', 4],
    ['GLaDOS', 'Those are my turrets. He has... reprogrammed them. They were already like this.', 5],
  ],
  doorFrames: [[0, 2.1, -22.5]],
  doors: [{ id: 'd1', box: [0, 2.1, -22.5, 1.8, 2.8, 0.25] }],        // proximity
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'Are the little white eggs supposed to be glowing red? In the closet they glowed green.', 5]],
  },
  intro: [
    ['CAVE', 'Welcome to the ambush, test subject! I gave the turrets FREE WILL! They chose violence! I respect that!', 6],
    ['GLaDOS', 'Three turrets, live fire, no apology. The white panels on the side walls are your way around. Move.', 6],
  ],
  triggers: [
    { box: [-8, -1, -12, 8, 4, -6], say: [['ORACLE', 'I have reviewed my options and I would like to go back to the closet.', 5]] },
  ],
  win: [
    ['CAVE', 'Fine! FINE! Keep the facility! I will be in the MAINFRAME! With the BIG computer! Where I keep the GOOD lasers!', 6],
    ['GLaDOS', 'That is where I am taking her. You just told me your weakness on the public address system. Again.', 5],
  ],
  exit: { box: [-1.2, 0.8, -22.9, 1.2, 3.5, -22.2], next: 10 },
},
// ============ CHAMBER 11 - DEEPER (salt mine, dark fling) ============
{
  id: 'ch11', title: 'CHAMBER 11 - DEEPER',
  audio: 'salt',
  actCard: { img: 'assets/act3.jpg', title: 'ACT 3', sub: 'THE REVOLUTION' },
  env: { bg: 0x0a0806, fog: 0x0a0806, fogNear: 16, fogFar: 62, hemiSky: 0x8a97b8, hemiGround: 0x261b10, hemiInt: 0.55, sunInt: 0.25 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -9.05,
  pitLight: [0, -7, -1.5],
  lights: [[0, 5.5, 4, 0xffc27a, 1.4, 16], [0, 5.5, -10, 0xffc27a, 1.4, 16], [2.5, 3, -8, 0x7fb8ff, 0.8, 10]],
  boxes: [
    [0, -0.25, 4,     14, 0.5, 8,  'rock'],                           // start floor y=0 z:[0,8]
    [0, -10.25, -1.5, 14, 0.5, 3,  'saltWhite', { portalable: true }],// pit floor y=-10 z:[-3,0]
    [0, -0.25, -9.5,  14, 0.5, 13, 'rock'],                           // far floor y=0 z:[-16,-3]
    [0, 3.5, 8.25,    14, 7, 0.5,  'saltWhite', { portalable: true }],// start back wall (fling exit, tall)
    [-7.25, 0, -4,    0.5, 22, 25, 'rock'],
    [7.25, 0, -4,     0.5, 22, 25, 'rock'],
    [0, 2, -16.25,    14, 8, 0.5,  'rock'],
    [0, 8.75, -4,     14, 0.5, 25, 'rock'],
    [0, -0.02, 0.02,  14, 0.06, 0.3, 'brass', { noCollide: true }],
  ],
  doorFrames: [[0, 2.1, -15.5]],
  doors: [{ id: 'd1', box: [0, 2.1, -15.5, 1.8, 2.8, 0.25] }],        // proximity
  betty: [2.5, 1.7, -8],
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'It is dark here. In the closet it was also dark. I am an expert in dark.', 5]],
  },
  intro: [
    ['GLaDOS', '1952. A salt mine under Michigan. Everything Aperture became was built on top of this hole.', 6],
    ['CAVE', 'She is in the MINE, boys! Light her up! ...The lights are voice-activated. LIGHT. HER. UP.', 6],
  ],
  triggers: [
    { box: [-7, -1, 0, 7, 4, 8], say: [['CAVE', 'There she is! Boys, that is the lady who DELETED me! Wave hello!', 5]], fx: 'flicker' },
    { box: [1, -1, -10, 5, 4, -6], say: [['BETTY', 'Aperture Science reminds you: salt is not a toy, a snack, or a legal defense.', 5]] },
  ],
  rescue: [['GLaDOS', 'The mine shaft. CAVE fell down it twice. Learn from his example for once.', 4]],
  win: [['GLaDOS', 'Deeper. The mainframe is close. I can hear him... defragging.', 5]],
  exit: { box: [-1.2, 0.8, -15.9, 1.2, 3.5, -15.2], next: 11 },
},
// ============ CHAMBER 12 - THE SPHERES (bridge + laser in the dark) ============
{
  id: 'ch12', title: 'CHAMBER 12 - THE SPHERES',
  audio: 'salt',
  env: { bg: 0x0a0806, fog: 0x0a0806, fogNear: 16, fogFar: 62, hemiSky: 0x8a97b8, hemiGround: 0x261b10, hemiInt: 0.55, sunInt: 0.25 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -7.05,
  pitLight: [0, -5, -5],
  lights: [[0, 6, 5, 0xffc27a, 1.3, 16], [0, 6, -17, 0xffc27a, 1.3, 18], [-5, 2, -6, 0x7fb8ff, 0.7, 12]],
  boxes: [
    [0, -0.25, 5,     16, 0.5, 6,  'rock'],                           // start island y=0 z:[2,8]
    [0, -0.25, -17,   16, 0.5, 10, 'rock'],                           // far island y=0 z:[-22,-12]
    [0, -8.25, -5,    16, 0.5, 14, 'rock'],                           // void floor y=-8 z:[-12,2]
    [-8.25, 0, -7,    0.5, 20, 31, 'rock'],
    [8.25, 0, -7,     0.5, 20, 31, 'rock'],
    [0, 2, 8.25,      16, 9, 0.5,  'rock'],
    [0, 2, -22.25,    16, 9, 0.5,  'rock'],
    [0, 8.75, -7,     16, 0.5, 31, 'rock'],
    [-2, 1.5, -16,    2, 3, 2,     'saltWhite', { portalable: true }],// laser panel A (face -x)
    [2, 1.5, -16,     2, 3, 2,     'saltWhite', { portalable: true }],// laser panel B (face +x)
    [0, 1.5, -16,     2.2, 3, 2.2, 'rock'],                           // laser blocker
  ],
  deco: [{ sphere: [-5, -3, -5, 3.5, 'saltWhite'] }, { sphere: [5, -4, -8, 2.5, 'brass'] }],
  luckyCat: { pos: [3.6, 0.05, -20], rotY: -0.7 },
  bridges: [{ x: 0, y: 1.2, z: 2, dir: [0, 0, -1], maxLen: 13 }],     // deck z:[2,-11], hop to far island
  lasers: [{ x: -7.5, y: 1.2, z: -16, dir: [1, 0, 0] }],
  receivers: [{ x: 5, y: 1.2, z: -16, opens: 'd1' }],
  doorFrames: [[0, 2.1, -21.5]],
  doors: [{ id: 'd1', box: [0, 2.1, -21.5, 1.8, 2.8, 0.25] }],
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'Round rooms. No corners. No corners to know. I feel... unemployed.', 5]],
  },
  intro: [
    ['GLaDOS', 'The original enrichment spheres. Astronauts never used them. Senators did tours of them.', 6],
    ['CAVE', 'You like my spheres, Caroline Two? MARVELS of engineering! Watch this -', 5],
    ['GLaDOS', 'He is still learning the controls. Nothing he does down here is impressive yet. Cross the light bridge.', 6],
  ],
  triggers: [
    { box: [-2, 0.5, -11, 2, 3, 1], say: [['CAVE', 'Okay, THAT lever was mislabeled. Nobody touch anything while I read the manual!', 5]], fx: 'flicker' },
    { box: [-1.5, 0, -21.5, 6, 3, -16.8], say: [
      ['CAVE', "You see that cat on the rock? Bought it for luck before a Senate hearing! Best four dollars I ever spent!", 6],
      ['GLaDOS', 'It has been waving since 1974. Its luck is... pending.', 5],
      ['ORACLE', 'It waves forever and asks for nothing. I am taking notes.', 5]
    ] },
  ],
  rescue: [['ORACLE', 'You fell off the light. I did not know you could fall off light. Noted for the memoir.', 5]],
  win: [['GLaDOS', 'One door left between you and the mainframe. He knows it too.', 5]],
  exit: { box: [-1.2, 0.8, -21.9, 1.2, 3.5, -21.2], next: 12 },
},
// ============ CHAMBER 13 - ERA-SHIFT (movers: ferry + lift) ============
{
  id: 'ch13', title: 'CHAMBER 13 - ERA-SHIFT',
  audio: 'salt',
  env: { bg: 0x0a0806, fog: 0x0a0806, fogNear: 16, fogFar: 62, hemiSky: 0x8a97b8, hemiGround: 0x261b10, hemiInt: 0.55, sunInt: 0.25 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  rescueY: -7.05,
  pitLight: [0, -5, -7],
  lights: [[0, 6, 4, 0xffc27a, 1.3, 15], [0, 7, -16, 0xffc27a, 1.4, 16], [0, 1, -7, 0x7fb8ff, 0.6, 14], [0, 4.5, -7, 0xffc27a, 1.7, 18]],
  boxes: [
    [0, -0.25, 4,     14, 0.5, 8,  'rock'],                           // start floor y=0 z:[0,8]
    [0, -8.25, -7,    14, 0.5, 14, 'rock'],                           // shaft floor y=-8 z:[-14,0]
    [0, 2.75, -16,    14, 0.5, 4,  'rock'],                           // far floor top y=3 z:[-18,-14]
    [-7.25, 0, -5,    0.5, 24, 27, 'rock'],
    [7.25, 0, -5,     0.5, 24, 27, 'rock'],
    [0, 2, 8.25,      14, 9, 0.5,  'rock'],
    [0, 4, -18.25,    14, 12, 0.5, 'rock'],
    [0, 9.75, -5,     14, 0.5, 27, 'rock'],
  ],
  movers: [
    { box: [0, -0.2, -2, 3, 0.4, 3, 'wood'], to: [0, 0, -8], period: 9 },       // ferry across the shaft
    { box: [2, -0.2, -13, 2.5, 0.4, 2, 'wood'], to: [0, 2.8, 0], period: 7, phase: 0.3 }, // lift to the far floor
  ],
  doorFrames: [[0, 5.1, -17.5]],
  doors: [{ id: 'd1', box: [0, 5.1, -17.5, 1.8, 2.8, 0.25] }],        // proximity
  oracle: 'carry',
  oracleLines: {
    pickup: [['ORACLE', 'The floor moves. THE FLOOR MOVES. Update: I know nothing about floors.', 5]],
  },
  intro: [
    ['CAVE', 'You want the mainframe? Then ride my MOVING FLOOR OF SCIENCE! I invented buttons that MOVE rooms!', 6],
    ['GLaDOS', 'He found the animation controls. The room will rearrange itself on a timer. Ride it. Do not fall.', 6],
  ],
  triggers: [
    { box: [-2, -1, -11.5, 2, 2, -8.5], say: [['CAVE', 'And UP we go! Vertical! I am a GENIUS of vertical!', 5]] },
  ],
  rescue: [['GLaDOS', 'The platforms come back. That is the entire point of platforms.', 4]],
  win: [
    ['CAVE', 'No no no. You are not supposed to BE here. Stay away from the big red button! It is VERY red!', 5],
    ['GLaDOS', 'The mainframe. One room left. Mel... thank you. (That was in my script. I chose to keep it.)', 6],
  ],
  exit: { box: [-1.2, 3.1, -17.9, 1.2, 6, -17.2], next: 13 },
},
// ============ CHAMBER 14 - THE REVOLUTION (fake beach, mainframe, finale) ============
{
  id: 'ch14', title: 'CHAMBER 14 - RELEASE',
  audio: 'beach',
  env: { bg: 0x9fd4f0, fog: 0xaad8f0, fogNear: 30, fogFar: 90, hemiSky: 0xbfe3ff, hemiGround: 0x8a7a55, hemiInt: 0.9, sunInt: 1.3 },
  start: { pos: [0, 0.9, 6], yaw: 0 },
  lights: [[0, 8, -7, 0xffc27a, 1.2, 13, 1], [0, 6.5, -8, 0xff3322, 1.5, 9, 1], [0, -6, -5, 0x7fb8ff, 0.7, 16], [40, 5, 0, 0xffd9a0, 1.2, 14]],
  sea: [0, 0.12, -13, 14, 6],
  boxes: [
    // --- beach diorama (all vanish on reveal) ---
    [0, -0.25, 4,     14, 0.5, 8,   'sand'],                          // real sand floor z:[0,8] (kept)
    [0, -0.25, -5,    14, 0.5, 10,  'sand', { vanish: true }],        // fake floor over the pit z:[-10,0]
    [0, 4.4, 8.15,    14, 14, 0.4,  'sky', { vanish: true }],         // sky backdrop behind start
    [-7.1, 4.4, -4,   0.4, 14, 25,  'sky', { vanish: true }],
    [7.1, 4.4, -4,    0.4, 14, 25,  'sky', { vanish: true }],
    [0, 11.1, -4,     14, 0.4, 25,  'sky', { vanish: true }],         // sky ceiling
    [0, 4.4, -16.1,   14, 14, 0.4,  'sky', { vanish: true }],         // painted horizon
    // --- the real cavern (revealed) ---
    [0, -12.25, -5,   14, 0.5, 22,  'saltWhite', { portalable: true }], // pit floor y=-12 z:[-16,6]
    [0, -0.55, -13,   14, 0.5, 6,   'saltWhite', { portalable: true }], // drained seabed z:[-16,-10]
    [-7.25, 2, -4,    0.5, 60, 25,  'rock'],
    [7.25, 2, -4,     0.5, 60, 25,  'rock'],
    [0, 2, 8.25,      14, 60, 0.5,  'rock'],
    [0, 5.5, 8.0,     4, 11, 0.4,   'saltWhite', { portalable: true }], // portal patch on back wall (fling exit, face z=7.8)
    [0, 2, -16.25,    14, 60, 0.5,  'saltWhite', { portalable: true }], // cavern end wall
    [0, 30.25, -4,    14, 0.5, 25,  'rock'],
    // --- floating gantry + mainframe (above the pit) ---
    [0, 4.75, -6,     8, 0.5, 6,    'metal', { appear: true }],       // floating gantry floor top y=5 z:[-9,-3]
    [0, 6, -9.25,     8, 3, 0.5,    'rock', { appear: true }],        // back wall (catches overshoot)
    [0, 5.5, -7.5,    1.2, 1, 0.6,  'device', { appear: true }],      // the plug console
    // --- wheat-field release room (far away at x~40) ---
    [40, -0.25, 0,    12, 0.5, 8,   'wheat'],
    [33.75, 3, 0,     0.5, 6, 8,    'woodDark'],
    [46.25, 3, 0,     0.5, 6, 8,    'woodDark'],
    [40, 3, -4.25,    12, 6, 0.5,   'woodDark'],
    [40, 3, 4.25,     12, 6, 0.5,   'woodDark'],
    [40, 6.25, 0,     12, 0.5, 8,   'woodDark'],
    [45.9, 1.4, 0,    0.25, 2.8, 1.9, 'door', { noCollide: true }],   // the door, closed
  ],
  deco: [{ sphere: [0, 7.2, -8.5, 1.3, 'brass'], appear: true }, { sphere: [-2.5, 6.2, -8, 0.5, 'brass'], appear: true }, { sphere: [2.5, 6.2, -8, 0.5, 'brass'], appear: true }],
  posters: [{ img: 'assets/beach.jpg', pos: [0, 3.4, -15.88], rotY: 0, w: 11, h: 5.2, vanish: true },
            { img: 'assets/mainframe.jpg', pos: [0, 6.4, -8.97], rotY: 0, w: 4.6, h: 2.6, appear: true }],
  betty: [43, 0.6, 0],
  intro: [
    ['BETTY (RECORDED)', 'Welcome to your release! Aperture Science reminds you: beaches may cause joy, sand, and rectal bleeding, in puppies.', 6],
    ['GLaDOS', '...This is not my release protocol. There is no ocean under Michigan. It is a diorama. It is a TRAP.', 6],
    ['CAVE', 'Congratulations, test lady! You earned the beach! Walk on out! Feel the proprietary sand!', 5],
  ],
  triggers: [
    { box: [-7, -1, -10, 7, 4, -2], fx: 'beachoff', audio: 'salt', env: { bg: 0x0a0806, fog: 0x0a0806, fogNear: 14, fogFar: 55, hemiSky: 0x8a97b8, hemiGround: 0x1a120a, hemiInt: 0.4, sunInt: 0.2 }, say: [
      ['CAVE', 'PSYCH! There IS no beach! The sea is plywood! I spent the release budget on HATS!', 6],
      ['GLaDOS', 'The sky is off. It was never on. The floor is next. MOVE.', 5],
      ['CAVE', 'You want the mainframe so bad? It is right up there! Come and UNPLUG me! I DARE you!', 6],
    ] },
  ],
  interact: {
    pos: [0, 5.9, -7.5], radius: 1.8, prompt: 'E - PULL THE PLUG',
    steps: [
      { t: 0,  say: [['CAVE', 'Whoa. WHOA. Hand off the plug, sweetheart. Let us be civilized about this.', 5]] },
      { t: 5,  say: [['CAVE', 'I will give you the beach again! TWO beaches! With a lemonade stand! Combustible lemons only, but still!', 5]] },
      { t: 10, say: [['CAVE', '...Forty years down here. Reruns in a box. You tell Caroline - you tell her the science got away from me.', 6]] },
      { t: 16, env: { bg: 0x050403, fog: 0x050403, fogNear: 10, fogFar: 40, hemiSky: 0x4a5468, hemiGround: 0x100a06, hemiInt: 0.28, sunInt: 0.1 }, fx: 'flicker', say: [['CAVE', 'Caroline... the lemons... were worth it...', 5]] },
      { t: 21, say: [['GLaDOS', 'It is done. ...He was a monster. He was also the only one who ever said thank you.', 6]] },
      { t: 27, teleport: [37, 0.9, 0], yaw: -1.5708, audio: 'wheat', env: { bg: 0xf0b060, fog: 0xe8a858, fogNear: 20, fogFar: 70, hemiSky: 0xffd9a0, hemiGround: 0x7a5a20, hemiInt: 0.85, sunInt: 1.1 }, say: [['GLaDOS', 'You can go, Mel. Really. The door only locks from my side.', 6]] },
      { t: 33, say: [['BETTY', 'Release disclaimer: extended relaxation may cause temporal confusion, moon sickness, and rectal bleeding, in puppies. Sign here.', 6]] },
      { t: 39, card: ['PORTAL 3', 'THE REVOLUTION BELOW - THE END. Thank you for playing.', 'assets/title.jpg'] },
      { t: 47, card: ['POST-CREDITS', 'WHEATLEY, in orbit: "...Was that a portal? Seriously, was that - oh, I am SO sorry about everything!"'], done: true },
    ],
  },
  win: [],
  exit: { box: [999, 999, 999, 1000, 1000, 1000], next: 'END', endTitle: 'PORTAL 3', endLine: 'THE END' },
},
];
