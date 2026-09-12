// WonderKids story library — content for the Story Reader.
// Each story has themed pages; each page references a scene from SCENES
// that the reader view uses to paint its illustrated background.

const SCENES = {
  forest: { grad: 'from-[#12314d] via-[#2c5e3f] to-[#7fae5f]', deco: ['🌲', '🌳', '🦉', '🌿', '🍄'], watermark: '🌲' },
  river: { grad: 'from-[#0f2c52] via-[#1f6da0] to-[#7ad0f0]', deco: ['💧', '🐟', '🪨', '🌊'], watermark: '💧' },
  cave: { grad: 'from-[#1c1025] via-[#3b1f5c] to-[#6d2e7e]', deco: ['✨', '🪨', '💎', '🕯️'], watermark: '💎' },
  waterfall: { grad: 'from-[#0b3d4d] via-[#1f7a8c] to-[#6fe0d0]', deco: ['💦', '🌈', '🪷', '✨'], watermark: '🌈' },
  home: { grad: 'from-[#4a2f1f] via-[#b06b2f] to-[#f8c46a]', deco: ['🏠', '🪟', '🥧', '☕'], watermark: '🏠' },
  meadow: { grad: 'from-[#2f6b3f] via-[#6fae4f] to-[#f4e08a]', deco: ['🌼', '🐝', '🦋', '🌷'], watermark: '🌼' },
  night: { grad: 'from-[#0b1026] via-[#1e2a5a] to-[#3f4f8f]', deco: ['🌙', '⭐', '✨', '🌠'], watermark: '🌙' },
  sky: { grad: 'from-[#2f7fd0] via-[#7ac2f0] to-[#f0f8ff]', deco: ['☁️', '☀️', '🪁', '🐦'], watermark: '☁️' },
  space: { grad: 'from-[#05060f] via-[#180f3a] to-[#4a2b7a]', deco: ['🪐', '⭐', '🌠', '☄️'], watermark: '🪐' },
  moon: { grad: 'from-[#1e2030] via-[#4a4f6a] to-[#b8bddb]', deco: ['🌕', '🪐', '⭐', '🚀'], watermark: '🌕' },
  volcano: { grad: 'from-[#1f1210] via-[#7c2d12] to-[#f97316]', deco: ['🌋', '🔥', '🪨', '✨'], watermark: '🌋' },
  cloud: { grad: 'from-[#1f3550] via-[#5d86b0] to-[#dce9f5]', deco: ['☁️', '⛅', '🦅', '🌤️'], watermark: '☁️' },
  ocean: { grad: 'from-[#042a4a] via-[#0e5a8a] to-[#2ea4d8]', deco: ['🌊', '🐬', '🐳', '🐟'], watermark: '🌊' },
  reef: { grad: 'from-[#064a5c] via-[#0f7d74] to-[#4fd1b0]', deco: ['🪸', '🐠', '🐡', '🐟'], watermark: '🪸' },
  shipwreck: { grad: 'from-[#08303f] via-[#1b4f63] to-[#3d8a99]', deco: ['🚢', '🐚', '🫧', '🪸'], watermark: '🚢' },
  deep: { grad: 'from-[#020617] via-[#10243f] to-[#244e75]', deco: ['🐙', '🦑', '🫧', '✨'], watermark: '🐙' },
  stage: { grad: 'from-[#2a0a3d] via-[#7a1f7a] to-[#ee66aa]', deco: ['🎵', '🎶', '🐚', '🎻'], watermark: '🎵' },
  garden: { grad: 'from-[#123a28] via-[#2e7d4f] to-[#7fd0a0]', deco: ['🌳', '🌸', '🦋', '🌻'], watermark: '🌸' },
  treehouse: { grad: 'from-[#2b3a1f] via-[#4a6b2f] to-[#9cbf6f]', deco: ['🏡', '🌿', '🗝️', '🐿️'], watermark: '🏡' },
  desert: { grad: 'from-[#5a3a12] via-[#c8852f] to-[#f8dda0]', deco: ['🏜️', '🐪', '🌵', '✨'], watermark: '🏜️' },
  savanna: { grad: 'from-[#3a4a1f] via-[#7a9c2f] to-[#f0d070]', deco: ['🦒', '🦁', '🌾', '🌅'], watermark: '🦁' },
  hills: { grad: 'from-[#12301f] via-[#3f7047] to-[#a8d48a]', deco: ['⛰️', '🐺', '🌿', '⭐'], watermark: '⛰️' },
  island: { grad: 'from-[#0e5a7a] via-[#2f9cb0] to-[#c9e8d0]', deco: ['🏝️', '🌴', '🐚', '🌅'], watermark: '🏝️' }
};

const STORIES = [
  {
    id: 'hungry-caterpillar',
    title: 'The Very Hungry Caterpillar',
    emoji: '🐛',
    subtitle: 'A classic tale of eating, growing, and transforming',
    summary: 'Follow a tiny, very hungry caterpillar as it eats its way through the week—from apples and pears to cake and ice cream—before spinning a cocoon and emerging as a beautiful butterfly.',
    lexile: 250,
    minutes: 5,
    ages: '3-7',
    rating: 5.0,
    cardGrad: 'from-[#2e7d4f] via-[#6fae4f] to-[#f4e08a]',
    coverImage: '/images/stories/hungry-caterpillar/page1.png',
    pages: [
      { chapter: 'A Little Egg', scene: 'meadow', text: 'In the light of the moon, a little egg lay on a green leaf.\n\nPop! Out came a tiny and very hungry caterpillar.', image: '/images/stories/hungry-caterpillar/page1.png' },
      { chapter: 'Monday — 1 Red Apple', scene: 'garden', text: 'He started to look for some food.\n\nOn Monday, he ate through 1 red apple. But he was still hungry!', image: '/images/stories/hungry-caterpillar/page2.png' },
      { chapter: 'Tuesday — 2 Sweet Pears', scene: 'garden', text: 'On Tuesday, he ate through 2 sweet pears. But he was still hungry!', image: '/images/stories/hungry-caterpillar/page3.png' },
      { chapter: 'Wednesday — 3 Purple Plums', scene: 'garden', text: 'On Wednesday, he ate through 3 purple plums. But he was still hungry!', image: '/images/stories/hungry-caterpillar/page4.png' },
      { chapter: 'Thursday — 4 Red Strawberries', scene: 'garden', text: 'On Thursday, he ate through 4 red strawberries. But he was still hungry!', image: '/images/stories/hungry-caterpillar/page5.png' },
      { chapter: 'Friday — 5 Juicy Oranges', scene: 'garden', text: 'On Friday, he ate through 5 juicy oranges. But he was still hungry!', image: '/images/stories/hungry-caterpillar/page6.png' },
      { chapter: 'Saturday — A Feast!', scene: 'home', text: 'On Saturday, he ate through cake, ice cream, a pickle, and a slice of watermelon!\n\nThat night, he had a big tummy ache!', image: '/images/stories/hungry-caterpillar/page7.png' },
      { chapter: 'Sunday — 1 Green Leaf', scene: 'forest', text: 'On Sunday, he ate through 1 nice green leaf.\n\nAfter that, his tummy felt much better!', image: '/images/stories/hungry-caterpillar/page8.png' },
      { chapter: 'A Big, Fat Caterpillar', scene: 'garden', text: 'Now he was not hungry anymore, and he was not a little caterpillar anymore.\n\nHe was a big, fat caterpillar!\n\nHe built a cozy small house, called a cocoon, around himself.', image: '/images/stories/hungry-caterpillar/page9.jpeg' },
      { chapter: 'A Beautiful Butterfly!', scene: 'meadow', text: 'He nibbled a hole in the cocoon, pushed his way out, and...\n\nHe was a beautiful butterfly!', image: '/images/stories/hungry-caterpillar/page10.jpeg' }
    ]
  },
  {
    id: 'whispering-forest',
    title: 'The Whispering Forest & The Lost Fox',
    emoji: '🦊',
    subtitle: 'A story about bravery, kindness and finding friends',
    summary: 'Follow Pip the little fox through the enchanted Whispering Forest as he follows a glowing trail, crosses a silver river, and helps a new friend find their way home.',
    lexile: 320,
    minutes: 8,
    ages: '4-8',
    rating: 4.9,
    cardGrad: 'from-[#12314d] via-[#2c5e3f] to-[#7fae5f]',
    pages: [
      { chapter: 'A Home at the Forest\'s Edge', scene: 'forest', text: 'Pip the little ginger fox lived in a cozy burrow at the very edge of the Whispering Forest, where the tall trees hummed soft, sleepy songs all day long. His mother tucked him in each night with a kiss on his tiny nose and a whispered, "Dream of adventures, little one." But Pip never dreamed of adventures—he lived them every single day.' },
      { chapter: 'The Humming Pines', scene: 'forest', text: 'One misty evening, as fireflies began their nightly dance, Pip heard a whisper that sounded just like his own name. It drifted from the deep green shadows, far beyond where he had ever played. The old pine trees swayed and hummed louder than ever, as if trying to tell him something important. Pip pressed his ear against the bark of the oldest oak and heard it again: "Pip… Pip… help me."' },
      { chapter: 'The Glowing Trail', scene: 'cave', text: 'Tiny glowing mushrooms lit a winding path through the dark woods, each one pulsing with a gentle blue light. Pip\'s paws tiptoed along the trail, full of nervous wonder and brave steps. The mushrooms seemed to know the way, lighting up just ahead of him and fading behind. An old toad sitting on a mossy stone croaked, "Follow the glow, little fox. It leads to those who need you most."' },
      { chapter: 'The Owl\'s Warning', scene: 'night', text: 'High in a twisted oak, a great grey owl named Sage spread her wings and called down to Pip. "The forest is deeper than you know, little fox. Not everything that whispers is friendly." Pip\'s heart thumped, but he remembered his mother\'s words: bravery is not the absence of fear—it is taking the next step even when your paws tremble. He thanked Sage and pressed on.' },
      { chapter: 'Crossing the Silver River', scene: 'river', text: 'A silver river sparkled ahead, so wide that the other side looked like a dream. Friendly stones stood like stepping tracks across the rushing water, each one etched with ancient symbols. Pip hopped across, splash by careful splash. A family of otters watched from the shallows, cheering him on with happy chirps. "You can do it!" they squeaked, and Pip believed them.' },
      { chapter: 'The Singing Stones', scene: 'river', text: 'On the far bank, Pip discovered that the stepping stones hummed a gentle melody when the water touched them. It was a lullaby—the same one his mother sang every night. How could stones know that song? He pressed his paw against one and felt it vibrate with warmth. The forest was full of mysteries, and Pip was beginning to understand that every creature, every stone, every tree was connected by an invisible thread of kindness.' },
      { chapter: 'The Enchanted Waterfall', scene: 'waterfall', text: 'Behind the roaring waterfall hid a shimmering cavern, its walls glittering with crystals that cast rainbow light across the water. Inside, a fox cub named Rowan sniffed the air and wagged a hopeful tail. Her russet fur was damp, and her eyes were wide with worry, but when she saw Pip, a smile broke across her face like sunrise over the hills.' },
      { chapter: 'Two Little Foxes', scene: 'cave', text: 'Rowan loved exploring but had wandered too far to find the way home. She had followed a butterfly into the cavern and lost the path back. Together the two friends shared a firefly lantern and made a plan. "We will follow the river upstream," Pip said confidently. "Rivers always lead home." Rowan nodded, and for the first time in hours, she felt safe.' },
      { chapter: 'The Journey Home', scene: 'forest', text: 'Through moonlit glades and over mossy logs, Pip and Rowan traveled together. They told each other stories to keep their spirits bright—tales of brave squirrels, magical mushrooms, and forests that sang. An old badger waved from his doorway. A family of rabbits pointed the way through a meadow of silver dew. Every creature they met offered help, and the two little foxes learned that the forest takes care of its own.' },
      { chapter: 'Home Before Dawn', scene: 'home', text: 'With Pip leading the way, they reached their burrows just as sunrise painted the sky gold and pink. Rowan\'s family rushed out, overjoyed, and Pip\'s mother wrapped him in the warmest hug he had ever felt. "Some friends arrive exactly when you need them most," Pip smiled, looking at Rowan. From that day on, the two foxes were inseparable, and the Whispering Forest hummed a new song—a song of friendship, bravery, and the magic of helping others.' }
    ]
  },
  {
    id: 'captain-leos-moon',
    title: 'Captain Leo\'s Moon Adventure',
    emoji: '🚀',
    subtitle: 'A counting adventure to the moon and back',
    summary: 'Young Captain Leo builds a cardboard rocket, blasts through the clouds, and lands on the moon to discover a glowing crystal cave that hums a counting song.',
    lexile: 380,
    minutes: 10,
    ages: '5-9',
    rating: 4.8,
    cardGrad: 'from-[#05060f] via-[#1e2a5a] to-[#8b5cf6]',
    pages: [
      { chapter: 'The Rocket in the Garden', scene: 'meadow', text: 'Leo built a cardboard rocket in his garden using tape, paint, and a whole lot of imagination. He drew stars on the sides with silver markers and a big number 1 on the nose cone. "Every great captain needs a ship," he said to his dog, Biscuit, who wagged his tail in agreement. That evening, Leo looked up at the sky and wished on the very first star with all his might.' },
      { chapter: 'Blast Off Into the Night', scene: 'night', text: 'With a whoosh and a pop, the cardboard rocket trembled, and to Leo\'s amazement, it actually lifted off! Up through the clouds they soared, past sleepy birds tucking their heads under wings, past kites caught in tall trees, and past floating dandelion seeds that sparkled like tiny stars. The town below became a glittering patchwork of lights.' },
      { chapter: 'Counting the Clouds', scene: 'cloud', text: 'Leo counted the clouds as he flew higher: 1 big fluffy cloud shaped like a whale, 2 wispy clouds like cotton candy, 3 dark storm clouds rumbling in the distance. He steered carefully around the storm clouds—captains always choose the safe path! Above the clouds, the sky turned from deep blue to midnight purple, and the first stars began to appear.' },
      { chapter: 'Sailing Through the Stars', scene: 'space', text: 'Starfish-shaped stars waved hello as Leo drifted past, their tiny arms twinkling in greeting. A friendly comet with a glowing tail whispered, "Keep going, little pilot!" Leo counted 4 shooting stars zooming past his window, each one leaving a trail of golden dust. He made 4 wishes—one for each star—and tucked them safely in his heart.' },
      { chapter: 'The Asteroid Field', scene: 'space', text: 'A field of spinning asteroids appeared ahead, tumbling and rolling like giant space marbles. Leo counted them as he steered through: 5 big ones, 6 medium ones, and 7 tiny ones that glittered like diamonds. He zigged and zagged with expert skill, and when he emerged safely on the other side, even the stars seemed to applaud.' },
      { chapter: 'Landing on the Moon', scene: 'moon', text: 'The moon was soft and snowy white, covered in gentle hills and peaceful craters. Leo bounced across it like a happy rubber ball in his silver spacesuit, leaving footprints in the moon dust. "One small step for Leo," he giggled, "one giant bounce for a kid captain!" The Earth hung in the sky like a beautiful blue marble, and Leo waved at it.' },
      { chapter: 'The Crystal Cave', scene: 'cave', text: 'Inside a deep crater cave, crystals glowed in rainbow colors—red, orange, yellow, green, blue, indigo, violet—and hummed a gentle counting song, one through eight. The walls sparkled like a thousand tiny chandeliers, and the air hummed with a melody that made Leo want to dance. He reached out and touched a crystal, and it sang a note so pure it made his heart sing too.' },
      { chapter: '5 + 3 = 8', scene: 'cave', text: 'Leo gathered 5 sparkling crystals from the cave floor—each one a different color of the rainbow. Then he found 3 more tucked inside a crevice, glowing brighter than all the rest. "5 plus 3 equals 8!" he counted proudly. That is exactly how many he packed into his rocket to share with his sister, Luna. She would love the purple one best, he decided.' },
      { chapter: 'The Long Journey Home', scene: 'space', text: 'The rocket carried Leo home through the starlight, sailing past the friendly comet, through the asteroid field (he counted them again just to be sure), and past the cloud shaped like a whale. The moon shone behind him like a nightlight, and Leo hummed the crystal cave\'s counting song all the way home. He was tired but happy, a true space captain with a pocket full of moonlight.' },
      { chapter: 'Home to Earth', scene: 'meadow', text: 'The rocket landed softly in the garden just as dawn tickled the sky pink and gold. Biscuit was waiting, tail wagging like a helicopter blade. Luna ran out in her pajamas, eyes wide with wonder. Leo handed her the purple crystal, and it hummed a gentle note. "I went to the moon," Leo said, yawning. "And I brought back magic." That night, the crystal glowed on Luna\'s bedside table, and both children dreamed of stars.' }
    ]
  },
  {
    id: 'baby-dragons-first-flight',
    title: 'The Baby Dragon\'s First Flight',
    emoji: '🐉',
    subtitle: 'A story about courage and trying new things',
    summary: 'Little Ember the dragon lives high on Sunstone Peak, but her wings tremble when she looks down. With a friendly breeze to help, Ember learns the sky belongs to brave little dragons too.',
    lexile: 350,
    minutes: 9,
    ages: '4-8',
    rating: 4.9,
    cardGrad: 'from-[#7c2d12] via-[#f97316] to-[#facc15]',
    pages: [
      { chapter: 'A Dragon\'s Nest', scene: 'volcano', text: 'High on Sunstone Peak, where the rocks were warm and the air smelled of cinnamon and smoke, little Ember peeked from her nest of pebbles and moss. Her parents soared above the clouds every day, their great wings catching the wind like ships\' sails. But Ember was small, and her wings were even smaller, and the whole wide world looked very, very far below.' },
      { chapter: 'Scary Heights', scene: 'cloud', text: 'The mountain was tall—so tall that clouds drifted past like lazy sheep. Ember\'s tiny wings trembled whenever she looked down from her ledge. "What if I fall?" she whispered to her stuffed toy, a little plush phoenix named Sunny. Sunny didn\'t answer (being a toy), but Ember imagined he said, "You won\'t fall, Ember. You\'re a dragon!" She wished she felt as brave as Sunny sounded.' },
      { chapter: 'Watching Others Fly', scene: 'sky', text: 'Every morning, Ember watched the other dragons take flight. Her mother soared like a golden kite, her father barrel-rolled through rainbows, and her older brother, Flint, was already learning to breathe fire while doing loop-de-loops. "I\'ll never be that good," Ember sighed, tucking her wings close. But deep inside, a tiny flame flickered—a flame that wanted to fly.' },
      { chapter: 'A Friendly Breeze', scene: 'cloud', text: 'One afternoon, a warm breeze drifted up from the valley and wrapped around Ember like a gentle hug. It lifted under her wings and whispered, "You are not alone, little dragon. The sky is your friend—it has been waiting for you." Ember felt the breeze tickle her wingtips, and for the first time, she didn\'t feel scared. She felt curious.' },
      { chapter: 'The First Leap', scene: 'volcano', text: 'Ember stood at the edge of her ledge, her heart beating like a tiny drum. She looked down at the clouds, then up at the endless blue sky. "One," she counted. "Two." She closed her eyes. "Three!" She jumped—and for one terrifying, wonderful second, she was falling. Then her wings caught the wind, and the falling turned into something magical.' },
      { chapter: 'Flap, Flap, Fly!', scene: 'sky', text: 'Ember flapped once, twice, three times, until her shadow danced beside her across the sunny valley. She was flying! Really, truly flying! The wind rushed past her ears, and the world spread out below like a painting—green forests, silver rivers, and tiny houses with smoking chimneys. She laughed, and a little puff of smoke came out of her nose. "I\'m doing it!" she cried.' },
      { chapter: 'Riding the Sunbeams', scene: 'sky', text: 'She looped and swirled through golden sunbeams, laughing as sparkles rained behind her glittering tail. A flock of birds chirped in surprise as she zoomed past, then cheered when they saw the joy on her face. Ember discovered that her small size made her nimble—she could turn faster, dive lower, and spin more gracefully than any of the bigger dragons.' },
      { chapter: 'Meeting the Cloud Giants', scene: 'cloud', text: 'High above the mountain, Ember met the Cloud Giants—great puffy shapes that drifted slowly across the sky. "Welcome, little dragon," rumbled the largest one, whose face was made of swirling mist. "We have been watching you. You flew with your heart today, and that is the bravest kind of flying." Ember bowed politely, and the Cloud Giant rumbled with laughter that sounded like distant thunder.' },
      { chapter: 'The Homecoming', scene: 'volcano', text: 'Ember glided home to her nest on wide, strong wings as the sun began to set, painting the sky in shades of orange, pink, and gold. Her mother was waiting on the ledge, eyes shining with pride. "I saw you fly, little one," she said, wrapping a wing around Ember. "You were magnificent." Ember\'s father landed beside them, and Flint did a celebratory loop-de-loop.' },
      { chapter: 'Dreams of Tomorrow', scene: 'volcano', text: 'That night, Ember fell fast asleep in her warm nest, dreaming of the endless sky and all the adventures waiting beyond the clouds. Sunny the phoenix sat beside her, and Ember could have sworn he was smiling. Outside, the stars twinkled over Sunstone Peak, and the warm breeze whispered one last thing: "Tomorrow, we fly even higher." And Ember smiled in her sleep, because she knew it was true.' }
    ]
  },
  {
    id: 'corals-underwater-orchestra',
    title: 'Coral\'s Underwater Orchestra',
    emoji: '🐠',
    subtitle: 'A musical adventure beneath the sea',
    summary: 'Coral the clownfish dreams of making music. With a clicking crab, a drumming whale and a singing ship, she turns the whole reef into one big underwater orchestra.',
    lexile: 280,
    minutes: 8,
    ages: '4-7',
    rating: 4.7,
    cardGrad: 'from-[#0e5a8a] via-[#0f7d74] to-[#4fd1b0]',
    pages: [
      { chapter: 'A Quiet Reef', scene: 'reef', text: 'Coral the little clownfish lived among rainbow corals in the most beautiful reef in the ocean. Schools of silver fish swam in perfect formation, sea turtles glided lazily by, and anemones waved like colorful feather dusters. But Coral wished the reef had a little more music in its days. "If only we had a song," she sighed, blowing tiny bubbles that floated upward like musical notes.' },
      { chapter: 'Click, Clack, Snip!', scene: 'reef', text: 'One morning, Coral heard a strange sound coming from behind a brain coral: click-clack-snip! Click-clack-snip! She peeked around and found an old crab named Clacker tapping shells with his claws like tiny cymbals. "I\'ve been making beats for sixty years," Clacker said proudly, his eyes twinkling. "Nobody ever listens, though." Coral\'s fins fluttered with excitement. "I\'m listening! Can you teach me?"' },
      { chapter: 'The Rhythm of the Reef', scene: 'reef', text: 'Clacker taught Coral the rhythm of the reef—the slow swish of the sea fans, the pop-pop-pop of pistol shrimp, the gentle whoosh of waves above. "Everything has a beat," Clacker said, snapping his claws. "You just have to listen." Coral closed her eyes and heard it everywhere—in the bubbles, in the currents, in the heartbeat of the ocean itself. Music was all around; she just hadn\'t noticed before.' },
      { chapter: 'The Drumming Whale', scene: 'ocean', text: 'A big blue whale named Thumper drifted by, his massive tail drumming the water: boom-boom-boom! The sound shook warm ripples across the sandy floor and made the seagrass dance. "Mr. Thumper!" Coral called out. "Would you like to join our orchestra?" The whale\'s enormous eye twinkled. "I\'ve been drumming alone for years," he rumbled. "I\'d love some company."' },
      { chapter: 'The Singing Ship', scene: 'shipwreck', text: 'Coral, Clacker, and Thumper explored deeper and found an old sunken ship resting on a bed of coral and starfish. Inside, an old brass horn sat in a shaft of sunlight, covered in barnacles but still beautiful. When a gentle current flowed through it, the horn sang: toot-a-toot! It had waited years—maybe centuries—for someone to play it. Coral carefully cleaned it, and the horn gleamed like new gold.' },
      { chapter: 'The Jellyfish Choir', scene: 'deep', text: 'Deeper still, in the twilight zone where sunlight barely reached, they discovered a forest of glowing jellyfish. Their bobbing lights made a silent, sparkly melody all of their own—pulsing in patterns that looked like sheet music written in light. "They\'re singing!" Coral whispered in awe. The jellyfish turned in unison, as if bowing, and joined the growing orchestra with their gentle, luminous harmonies.' },
      { chapter: 'The Sea Horse Violin', scene: 'reef', text: 'On the way back to the reef, they met a seahorse named Harmony who played a tiny violin made from a sea urchin spine and kelp strings. The music she made was so sweet that even the sharks stopped to listen (and sharks rarely stop for anything). "May I join you?" Harmony asked shyly. "The more musicians, the better!" Coral cheered.' },
      { chapter: 'Rehearsal Day', scene: 'reef', text: 'The whole reef buzzed with excitement as the orchestra gathered for their first rehearsal. Clacker kept the beat with click-clack-snip, Thumper added the boom-boom-boom, Harmony\'s violin sang sweet melodies, the horn tooted harmonies, and the jellyfish choir glowed in perfect rhythm. But something was missing. "We need a conductor!" said Thumper. Everyone looked at Coral.' },
      { chapter: 'Coral Takes the Stage', scene: 'stage', text: 'Coral had never conducted before, but she had listened to the ocean\'s music her whole life. She rose above the reef, her little fins outstretched like a maestro\'s baton, and began to conduct. Left fin for the strings, right fin for the drums, a twirl for the choir. The music swelled—click and boom and toot and hum—rising through the water like a living thing.' },
      { chapter: 'The Grand Concert', scene: 'stage', text: 'Everyone played together that shimmering evening as the sunset painted the surface gold and pink. Fish from every corner of the ocean came to listen, swaying in the current. Turtles tapped their flippers, starfish clapped their arms, and even the old octopus in the cave cracked a smile. Coral\'s underwater orchestra was the most beautiful thing the reef had ever heard. And from that day on, the ocean was never quiet again—it sang.' }
    ]
  },
  {
    id: 'magic-treehouse-mystery',
    title: 'The Magic Treehouse Mystery',
    emoji: '🌳',
    subtitle: 'Two twins, one door, a kingdom of secrets',
    summary: 'Behind Grandma\'s house, a strange little door hides a treehouse of maps to kingdoms that never met. Twins Mia and Max step through and discover where the best adventure of all truly lives.',
    lexile: 400,
    minutes: 10,
    ages: '6-10',
    rating: 4.8,
    cardGrad: 'from-[#2e7d4f] via-[#6b9c3e] to-[#c9a33e]',
    pages: [
      { chapter: 'The Tree at the Edge', scene: 'garden', text: 'Behind Grandma\'s house, where the garden met the wild meadow, stood the enormous Whisperwood tree. Its trunk was as wide as a car, its branches twisted like sleeping dragons, and its leaves whispered secrets to anyone who listened. But the most remarkable thing about the Whisperwood tree was the strange little door tucked into its trunk—a door that Grandma always said led to "nowhere special."' },
      { chapter: 'The Secret Door', scene: 'treehouse', text: 'Twins Mia and Max had never opened that door—until the afternoon Grandma fell asleep in her rocking chair and a golden key fell from her apron pocket. "Should we?" Mia whispered. "We definitely should," Max grinned. The key fit perfectly, the lock clicked, and the door swung open to reveal a spiral staircase of glowing roots that led up, up, up into a treehouse covered in maps of kingdoms the twins had never seen.' },
      { chapter: 'The Map Room', scene: 'treehouse', text: 'The treehouse was enormous—far bigger than any treehouse should be. Maps covered every wall, showing deserts with singing dunes, oceans with underwater cities, mountains that touched the moon, and forests where the trees could walk. In the center stood a brass compass that spun wildly, pointing to each map in turn. "These are real places," Mia breathed, touching a map that shimmered under her fingers. "Places that never met each other."' },
      { chapter: 'A Desert That Sings', scene: 'desert', text: 'The compass pointed to the desert map, and suddenly the floor became sand. The twins stepped out onto golden dunes where humpy camels sang old travel songs beneath the blazing sun. The sand hummed beneath their feet—a deep, ancient melody that spoke of caravans and starlit oases. A camel named Sahara offered them a ride, and they rode across the dunes as the desert sang its thousand-year-old lullaby.' },
      { chapter: 'The Singing Statues', scene: 'desert', text: 'In the heart of the desert stood a circle of ancient statues, their stone faces worn smooth by wind and time. As the sun set, the statues began to hum—and the melody was the same lullaby Grandma hummed at bedtime. "How could statues know that gentle tune?" Max wondered aloud. A sand fox appeared and whispered, "All songs are connected, child. The same melody echoes through every kingdom, if you know how to listen."' },
      { chapter: 'The Undersea Kingdom', scene: 'ocean', text: 'The compass spun again, and the sand became water—warm, crystal-clear water that sparkled with bioluminescent fish. The twins discovered they could breathe and swim as naturally as walking. Below them lay an underwater city of coral towers and pearl windows, where merfolk traded stories instead of gold. "We\'ve been waiting for you," said a mermaid with sea-green hair. "The treehouse chose you."' },
      { chapter: 'The Clockwork Garden', scene: 'garden', text: 'Back in the treehouse, the compass pointed to a new map: a garden of brass flowers that bloomed with tiny silver chimes. Each petal opened with a mechanical click, revealing gears of amber and emerald inside. A clockwork butterfly landed on Mia\'s shoulder and whispered the garden\'s secret: it was built by the same hands that carved the singing statues and planted the Whisperwood tree.' },
      { chapter: 'The Frozen Mountain', scene: 'hills', text: 'The next map led to a frozen mountain where the air was crisp and the snow sparkled like crushed diamonds. At the summit, a crystal palace reflected rainbows in every direction. Inside, an ice bear guardian told them, "Every kingdom you\'ve visited is part of one great story—the story of wonder. And wonder lives in children who are brave enough to explore."' },
      { chapter: 'The Key of Whispers', scene: 'treehouse', text: 'On the highest branch of the treehouse, hidden behind the biggest map, Mia and Max found a small brass key engraved with the words: "Home is the best adventure of all." The compass stopped spinning and pointed straight down—toward Grandma\'s garden. The twins looked at each other and smiled. They had traveled to deserts, oceans, mountains, and magical gardens, but the greatest discovery was waiting right where they started.' },
      { chapter: 'Back Before Dinner', scene: 'garden', text: 'Through the door and down the spiral roots, the twins arrived home in perfect time for Grandma\'s warm apple pie. She was awake now, humming that familiar lullaby, and she winked at them over her reading glasses. "Find anything interesting?" she asked with a knowing smile. "Everything," Mia and Max said together, sharing a secret look. Grandma placed the golden key back in her apron, and the Whisperwood tree outside rustled its leaves—as if saying, "Until next time."' }
    ]
  },
  {
    id: 'wolf-who-loved-stars',
    title: 'The Wolf Who Loved Stars',
    emoji: '🐺',
    subtitle: 'A gentle tale of friendship and night skies',
    summary: 'A lone wolf named Moonhowl adores the night sky. When a little star tumbles down, he learns that the brightest thing in the sky is a friendship that shines forever.',
    lexile: 340,
    minutes: 8,
    ages: '5-9',
    rating: 4.9,
    cardGrad: 'from-[#0f172a] via-[#334155] to-[#818cf8]',
    pages: [
      { chapter: 'A Lone Wolf on the Hill', scene: 'hills', text: 'On the high green hill, where the grass swayed like silver waves under moonlight, a young wolf named Moonhowl loved watching the stars more than anything else in the world. Every night he climbed to the very top of the hill, lay on his back, and stared up at the sky. He knew every constellation by name—the Great Dipper, the Sleeping Fox, the Wishing Crown—and he believed with all his heart that the stars were watching him back.' },
      { chapter: 'The Nightly Song', scene: 'night', text: 'Each night, Moonhowl howled a soft, sweet melody to the stars. It wasn\'t a lonely howl—it was a greeting, a conversation between a wolf and the cosmos. The other animals thought he was strange. "Stars can\'t hear you," said the owl. "Stars don\'t care," said the raccoon. But Moonhowl knew better. Sometimes, just sometimes, a star would twinkle brighter right in the middle of his song, and that was all the answer he needed.' },
      { chapter: 'A Falling Wish', scene: 'night', text: 'One crisp autumn night, as Moonhowl began his song, a tiny star wobbled in the sky, then tumbled downward in a shower of golden sparks. It landed on the hillside with a soft puff and blinked up at Moonhowl with nervous light. The star was no bigger than a pinecone, warm but never too hot, and it hummed a little tune that sounded exactly like Moonhowl\'s nightly howl. "You fell!" Moonhowl gasped. "You caught me," the star whispered back.' },
      { chapter: 'Cool, Gentle Fire', scene: 'night', text: 'The star was warm but never too hot, and it giggled, sparkle by sparkle, when Moonhowl gave it a careful lick. Its name was Twinkle, and it had been watching Moonhowl from the sky for months. "Your songs are the best part of my night," Twinkle said shyly. "I leaned too far forward to listen, and—well—here I am." Moonhowl promised to keep Twinkle safe and warm until they could figure out how to send it home.' },
      { chapter: 'The Star\'s Home', scene: 'night', text: '"I must return to the sky before sunrise," sighed Twinkle, its light flickering with worry, "or I will lose my family forever. Stars that stay on the ground fade by dawn, and the sky forgets we ever existed." Moonhowl\'s heart ached. He looked up at the vast, star-filled sky—it seemed impossibly far away. "How do we get you back up there?" he asked. Twinkle dimmed. "I don\'t know. No star has ever gone home from the ground."' },
      { chapter: 'A Plan Under the Moon', scene: 'night', text: 'Moonhowl thought hard. He ran to the wise old owl, who said, "The answer is in the old stories." He visited the ancient tortoise, who said, "The answer is in the wind." Finally, he climbed the tallest pine tree and asked the eagle, who said, "The answer is in your howl, young wolf. The sky remembers every song ever sung to it." Moonhowl\'s eyes widened. He knew what he had to do.' },
      { chapter: 'A Sky Full of Friends', scene: 'savanna', text: 'Moonhowl howled, and every sky creature came running. The owls hooted in harmony, the bats swooped in patterns that traced the constellations, and even the fireflies rose from the meadow in glowing clouds. High above, the wind carried Moonhowl\'s song to the clouds, who carried it higher still—to the very edge of the sky. And the sky, which remembered every song, began to glow.' },
      { chapter: 'The Great Lift', scene: 'night', text: 'Together they sang—wolf, owl, bat, firefly, and wind—and the sound became a beam of silver light that stretched from the hilltop to the heavens. Twinkle floated upward, slowly at first, then faster, spinning with joy. "Thank you!" it called, its voice growing fainter. "I\'ll never forget you, Moonhowl! Look for me—I\'ll be the brightest star in the sky!" And with a final flash, Twinkle was home.' },
      { chapter: 'A New Constellation', scene: 'night', text: 'That night, a new constellation appeared in the sky—the shape of a wolf, howling at the moon. Twinkle was its brightest star, shining right where the wolf\'s heart would be. The other animals gathered on the hilltop, staring in wonder. "You were right," whispered the owl. "The stars were listening all along." Moonhowl smiled and howled his nightly song, and the wolf constellation twinkled back.' },
      { chapter: 'Wishing on Moonhowl', scene: 'savanna', text: 'Now when friends wish upon the brightest star, Moonhowl winks from his hill—and the star shines just a little brighter. Children who look up at the night sky sometimes see a wolf-shaped constellation with one star that pulses like a heartbeat. That is Twinkle, still listening to Moonhowl\'s song, still remembering the night a wolf taught the sky that friendship is the brightest thing in the universe. And every night, the howl rises, and the stars answer back.' }
    ]
  }
];

function getStory(id) {
  return STORIES.find(function (s) { return s.id === id; }) || null;
}

module.exports = { SCENES, STORIES, getStory };
