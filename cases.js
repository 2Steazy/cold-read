/*
 * Cold Read — case library.
 *
 * Each case is one day's puzzle. Cases rotate in order, one per day,
 * starting from LAUNCH_DATE in game.js. To add a case, append another
 * object with the same shape. Every fact should be checkable against
 * the sources listed on the case.
 *
 * Stage fields:
 *   date      — when this part of the investigation happened
 *   briefing  — what the detective knows at this point (no spoilers)
 *   question  — what the player must answer
 *   answers   — accepted typed answers (matching ignores case,
 *               punctuation and small typos)
 *   hints     — two hints, shown after the 1st and 2nd wrong guess
 *   reveal    — the true detail, shown once the stage is closed
 */
window.COLD_READ_CASES = [
  {
    id: "btk",
    title: "The BTK Investigation",
    place: "Wichita, Kansas",
    span: "1974 – 2005",
    yearsOpen: 31,
    summary:
      "Ten people were killed in and around Wichita between 1974 and 1991. The killer named himself in letters to the press, then went silent for 25 years. In 2004 he started writing again. Work the case the way investigators did, one piece of evidence at a time.",
    stages: [
      {
        date: "October 1974",
        briefing:
          "Nine months after four members of the Otero family were killed in their Wichita home, a man phones an editor at The Wichita Eagle. He says a letter describing the crime is hidden inside a mechanical-engineering book, and he tells the editor where the book is shelved.",
        question: "Where in Wichita was the book?",
        answers: [
          "wichita public library",
          "public library",
          "library",
          "the library",
          "downtown library",
          "city library",
          "central library"
        ],
        hints: [
          "It's a public building that lends books.",
          "The city's main ______ library, downtown."
        ],
        reveal:
          "The Wichita Public Library. The letter claimed the Otero killings and included details only the killer could have known."
      },
      {
        date: "February 1978",
        briefing:
          "After more killings and little press coverage, the writer mails a letter to Wichita station KAKE-TV. He complains about the lack of attention and offers a list of nicknames for himself, including 'The Wichita Strangler' and 'The Asphyxiater.' One three-letter code, first used in the 1974 letter, is the one the public will remember.",
        question: "What three-letter name stuck?",
        answers: [
          "btk",
          "b t k",
          "btk killer",
          "the btk killer",
          "btk strangler",
          "bind torture kill",
          "bind them torture them kill them"
        ],
        hints: [
          "It's an abbreviation of his method.",
          "B _ K"
        ],
        reveal:
          "BTK, for 'bind, torture, kill.' The 1978 letter claimed seven victims. After 1979 his letters stopped for 25 years."
      },
      {
        date: "March 19, 2004",
        briefing:
          "The Eagle has just run a 30th-anniversary story on the case. A reporter opens an envelope with the return-address name 'Bill Thomas Killman.' Inside are three photographs and a photocopy of one item that belonged to Vicki Wegerle, a 28-year-old mother strangled at home in 1986. Nobody had linked her death to BTK. Her family says this item was the only thing missing from the house.",
        question: "What item was photocopied?",
        answers: [
          "drivers license",
          "driver license",
          "drivers licence",
          "driving license",
          "driving licence",
          "license",
          "licence",
          "her license",
          "her drivers license",
          "id",
          "id card",
          "identification",
          "photo id"
        ],
        hints: [
          "Most people carry it in a wallet.",
          "It's issued by the state and lets you drive."
        ],
        reveal:
          "Her driver's license. Only her killer could have had it. BTK had just tied himself to a murder police didn't know was his, and he was writing again."
      },
      {
        date: "January 2005",
        briefing:
          "BTK starts leaving packages around Wichita. One message sends KAKE-TV to a cereal box in the back of a pickup truck in a Home Depot parking lot. Investigators pull security video from his drop-offs. The figure is too far away to show a face, but the footage shows what he was driving.",
        question: "What kind of vehicle was it?",
        answers: [
          "jeep",
          "jeep cherokee",
          "black jeep",
          "black jeep cherokee",
          "a jeep",
          "a black jeep",
          "a jeep cherokee",
          "a black jeep cherokee",
          "cherokee",
          "jeep suv"
        ],
        hints: [
          "A small American SUV.",
          "A black ____ Cherokee."
        ],
        reveal:
          "A black Jeep Cherokee. Not enough to find him on its own, but something to check a suspect against."
      },
      {
        date: "Early 2005",
        briefing:
          "In a note, BTK asks police whether he can send them a floppy disk without it being traced back to a computer, and asks them to be honest. He doesn't want a reply by phone or by letter. He tells them exactly where to post their answer, using the coded line 'Rex, it will be OK.'",
        question: "Where did police publish their answer?",
        answers: [
          "newspaper",
          "the newspaper",
          "in the newspaper",
          "wichita eagle",
          "the wichita eagle",
          "eagle",
          "the eagle",
          "classified",
          "classifieds",
          "classified ad",
          "classified ads",
          "the classifieds",
          "newspaper ad",
          "an ad",
          "ad",
          "advertisement",
          "personal ad",
          "personals",
          "ad in the newspaper",
          "ad in the paper",
          "the paper",
          "paper",
          "ad in the wichita eagle"
        ],
        hints: [
          "Somewhere printed that anyone in Wichita could read.",
          "The classified ads in the city's daily paper."
        ],
        reveal:
          "A classified ad in The Wichita Eagle. It told BTK what he wanted to hear. It wasn't true."
      },
      {
        date: "February 2005",
        briefing:
          "KSAS-TV receives a package with a floppy disk inside. The visible file is a short message. Examiners recover data from a document that had been deleted from the disk and read its properties: it was last modified by a user named 'Dennis,' and it carried the name of an organization in Wichita.",
        question: "What organization's name was in the hidden data?",
        answers: [
          "christ lutheran church",
          "christ lutheran",
          "lutheran church",
          "lutheran",
          "church",
          "a church",
          "the church",
          "his church"
        ],
        hints: [
          "A place of worship.",
          "A Lutheran congregation in Wichita."
        ],
        reveal:
          "Christ Lutheran Church. Detectives looked up the church online and found the president of its congregation council."
      },
      {
        date: "February 2005",
        briefing:
          "The council president is a 59-year-old compliance officer for the suburb of Park City. He is an Air Force veteran, a Cub Scout leader, and a former ADT home-security installer. He is married with two grown children. His first name matches the metadata on the disk.",
        question: "Name the suspect.",
        answers: [
          "dennis rader",
          "rader",
          "dennis lynn rader",
          "dennis l rader"
        ],
        hints: [
          "His first name is on the disk: Dennis.",
          "Dennis R _ _ _ R"
        ],
        reveal:
          "Dennis Lynn Rader. To confirm it without alerting him, investigators got a warrant for a Pap smear sample his daughter had given years earlier at a university clinic. The family DNA matched evidence from the BTK crimes."
      }
    ],
    epilogue: [
      "February 25, 2005: Rader is arrested in Park City as he drives home for lunch.",
      "June 2005: on the first day of his trial, he pleads guilty to 10 counts of first-degree murder.",
      "August 18, 2005: he is sentenced to 10 consecutive life terms.",
      "In his interrogation he was angry that police had lied about the disk being untraceable."
    ],
    victims: [
      { name: "Joseph Otero", year: 1974 },
      { name: "Julie Otero", year: 1974 },
      { name: "Josephine Otero", year: 1974 },
      { name: "Joseph Otero II", year: 1974 },
      { name: "Kathryn Bright", year: 1974 },
      { name: "Shirley Vian", year: 1977 },
      { name: "Nancy Fox", year: 1977 },
      { name: "Marine Hedge", year: 1985 },
      { name: "Vicki Wegerle", year: 1986 },
      { name: "Dolores Davis", year: 1991 }
    ],
    sources: [
      { title: "A&E: Case File — Dennis Rader", url: "https://www.aetv.com/articles/dennis-rader" },
      { title: "Oxygen: How a floppy disk exposed the BTK killer", url: "https://www.oxygen.com/snapped/crime-time/floppy-disk-exposed-dennis-rader-btk-killer" },
      { title: "NBC News: Kansas serial killer resurfaces (2004)", url: "https://www.nbcnews.com/id/wbna4615264" },
      { title: "CBS News: Serial fear grips Wichita again (2004)", url: "https://www.cbsnews.com/news/serial-fear-grips-wichita-again" },
      { title: "Biography: BTK Killer timeline", url: "https://www.biography.com/crime/btk-killer-dennis-rader-timeline" },
      { title: "Refinery29: How the BTK killer was caught", url: "https://refinery29.com/en-us/2019/08/240899/btk-killer-caught-when-how-floppy-disk-dennis-rader" },
      { title: "Wikipedia: Dennis Rader", url: "https://en.wikipedia.org/wiki/Dennis_Rader" }
    ]
  }
];
