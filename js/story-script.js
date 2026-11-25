/* =========================================================
   KỊCH BẢN MY STORY – toàn bộ chữ hiện trong game (lời thoại + tiêu đề + popup + quest + thẻ kết)
   ChatGPT viết (chat "Rewrite Game Dialogue"), bản đầy đủ + nháp World 3–6: docs/kich-ban.md
   Sửa chữ ở đây, không cần đụng vào story.js / story-w2.js. {n} = số được điền tự động.
   ========================================================= */
window.STORY_SCRIPT = {
  "lines": {
    "w1_1": "I was 18, with my parents there to see me off.",
    "w1_2": "My university was almost 1,000 km south, in Nha Trang.",
    "w1_3": "My first time away from home. Here goes nothing.",
    "w1_go": "And off I went. Next stop: Nha Trang.",
    "map_1": "Ninh Bình. Where my story began.",
    "map_2": "A small train, a long way south.",
    "map_3": "I'd never been this far from home.",
    "map_4": "Nha Trang, finally. Hello, sea.",
    "w2_1": "Sunshine, sea breeze, and absolutely nobody I knew.",
    "w2_2": "A military university. Four years of civilian student life began here.",
    "w2_3": "My solo adventure didn't stay solo for long.",
    "w2_4": "Military instructors, computer labs, and plenty to learn.",
    "w2_5": "We studied together. Somehow, we all made it through.",
    "w2_6": "By year two, I was juggling classes and an internship.",
    "w2_7": "Work by day. Study by night. Powered by instant noodles.",
    "w2_8": "Weekends were for two wheels and somewhere new.",
    "w2_9": "Somehow, four years had gone by already.",
    "w2_grad": "Graduated with a Good rank. Not bad for this road tripper.",
    "fly_1": "Degree unlocked. Time to pack my bags again.",
    "fly_2": "My party stayed behind. I was going solo again.",
    "fly_3": "Same country, opposite direction. A slightly faster ride this time.",
    "fly_4": "Next stop: Hà Nội. Time to become a developer.",
    "w3_1": "Hello, Hà Nội. A new city, and a career to start.",
    "w3_2": "My interview at Superrender Farm wasn't exactly my finest performance.",
    "w3_3": "My attitude got me through the door. The rest was learning.",
    "w3_4": "I went from university assignments to real code and render servers.",
    "w3_5": "Then I met an experienced developer with ambitions beyond the ordinary.",
    "w3_6": "I followed his lead, taking on key responsibilities across startups and projects.",
    "w3_7": "I worked alongside talented people who constantly raised my standards.",
    "w3_8": "Deadlines kept me up late. Coffee wasn't always enough.",
    "w3_9": "COVID emptied the streets. My office became a room at home.",
    "w3_10": "Then came war, economic uncertainty, and numbers moving the wrong way.",
    "w3_11": "One by one, I watched familiar faces leave the office.",
    "w3_12": "The team grew smaller. My boss and I stayed.",
    "w3_13": "I kept showing up, solving problems, and building what came next.",
    "w3_14": "Then came AI. I learned to make it part of my toolkit.",
    "w3_15": "I came through those years with more experience and better perspective.",
    "w3_16": "I've learned from good people, tough projects, and a few setbacks.",
    "w3_17": "I keep exploring new technologies and turning my ideas into projects.",
    "w3_18": "Next stop? A team where my experience can make a difference.",
    "w3_wed1": "In May, I went home to Ninh Bình for my wedding.",
    "w3_wed2": "Six years of learning. Now, I'm starting a family of my own.",
    "w3_wed3": "We took a photo. A little reminder of how far I'd come.",
    "w3_home1": "My wife works by day, sewing scrunchies to sell by night.",
    "w3_home2": "I keep learning, with more ideas than hours in the day.",
    "w3_home3": "We're building our future together, and I'm exploring new opportunities."
  },
  "ui": {
    "title_w1": {
      "title": "WORLD 1",
      "sub": "THE DEPARTURE"
    },
    "depart_hint": "SCROLL ▼ TO DEPART",
    "popup_quest_start": {
      "title": "QUEST STARTED",
      "sub": "Go south · 1,000 km"
    },
    "title_map": {
      "title": "954 KM",
      "sub": "NINH BÌNH ▸ NHA TRANG"
    },
    "popup_arrive_nt": {
      "title": "ARRIVED!",
      "sub": "Nha Trang · 954 km from home"
    },
    "title_w2": {
      "title": "WORLD 2",
      "sub": "NHA TRANG"
    },
    "popup_party_join": {
      "title": "NEW PARTY MEMBER!",
      "sub": "PARTY {n} / 4"
    },
    "quest_main": "MAIN QUEST · Graduate",
    "quest_side": "SIDE QUEST · Internship",
    "popup_side_unlock": {
      "title": "LEVEL UP!",
      "sub": "Side quest unlocked: Internship"
    },
    "popup_side_done": {
      "title": "SIDE QUEST ✓",
      "sub": "Internship complete"
    },
    "popup_achievement": {
      "title": "ACHIEVEMENT!",
      "sub": "Road Tripper · 4 / 4 trips"
    },
    "popup_grad": {
      "title": "QUEST COMPLETE!",
      "sub": "Graduated · Rank: GOOD"
    },
    "polaroid_caption": "GRADUATED · RANK: GOOD (KHÁ)",
    "title_fly": {
      "title": "1,060 KM",
      "sub": "NHA TRANG ▸ HÀ NỘI"
    },
    "popup_party_leave": {
      "title": "LEFT THE PARTY",
      "sub": "PARTY {n} / 4"
    },
    "popup_arrive_hn": {
      "title": "ARRIVED!",
      "sub": "Hà Nội · Nội Bài"
    },
    "endcard": {
      "title": "WORLD 2 CLEAR!",
      "sub": "Next: WORLD 3 · Hà Nội"
    },
    "title_w3": {
      "title": "WORLD 3",
      "sub": "HÀ NỘI"
    },
    "popup_hired": {
      "title": "QUEST ACCEPTED!",
      "sub": "First job · Superrender Farm"
    },
    "popup_mentor": {
      "title": "MENTOR FOUND",
      "sub": "A bigger vision"
    },
    "popup_startup": {
      "title": "NEW QUEST!",
      "sub": "Build something together"
    },
    "popup_team": {
      "title": "NEW PARTY MEMBER!",
      "sub": "PARTY {n}"
    },
    "popup_nightowl": {
      "title": "ACHIEVEMENT UNLOCKED!",
      "sub": "Night Owl"
    },
    "era_covid": {
      "title": "2020",
      "sub": "THE WORLD STOOD STILL"
    },
    "era_war": {
      "title": "2022",
      "sub": "UNCERTAIN TIMES"
    },
    "popup_left": {
      "title": "LEFT THE PARTY",
      "sub": "PARTY {n}"
    },
    "popup_stayed": {
      "title": "QUEST ONGOING",
      "sub": "Still here. Still building."
    },
    "era_ai": {
      "title": "2023",
      "sub": "A NEW ERA"
    },
    "popup_ai": {
      "title": "SKILL TREE EXPANDED",
      "sub": "AI · Agents · Automation"
    },
    "popup_family": {
      "title": "NEW CHAPTER UNLOCKED",
      "sub": "Building a life together"
    },
    "sheet_title": "CHARACTER SHEET",
    "sheet_class": "CLASS: FULL-STACK DEVELOPER",
    "sheet_quote": "Still curious. Still learning. Still building.",
    "sheet_stats": [
      "ATTITUDE",
      "RESILIENCE",
      "BACKEND",
      "FRONTEND",
      "CLOUD",
      "AI",
      "TEAMWORK"
    ],
    "sheet_values": {
      "ATTITUDE": 99,
      "RESILIENCE": 99,
      "BACKEND": 85,
      "FRONTEND": 80,
      "CLOUD": 75,
      "AI": 80,
      "TEAMWORK": 90
    },
    "sheet_cta": "LET'S BUILD SOMETHING",
    "era_hn": {
      "title": "2019",
      "sub": "A NEW CITY. A NEW CAREER."
    },
    "era_wedding": {
      "title": "MAY 2026",
      "sub": "NINH BÌNH · A FAMILY OF MY OWN"
    },
    "popup_wife": {
      "title": "LIFELONG PARTY MEMBER!",
      "sub": "PARTY {n}"
    },
    "tag_me": "TRUNG",
    "tag_boss": "★ BOSS",
    "tag_boss1": "1ST BOSS",
    "tag_wife": "♥ WIFE",
    "era_now": {
      "title": "NOW",
      "sub": "HÀ NỘI · BUILDING OUR FUTURE"
    },
    "popup_wife_startup": {
      "title": "NEW SIDE QUEST!",
      "sub": "Her handmade scrunchie business"
    }
  }
};
