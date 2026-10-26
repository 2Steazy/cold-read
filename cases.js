/*
 * Cold Read — case library.
 *
 * One case per day, rotating from LAUNCH_DATE in game.js.
 *
 * A case is a set of chapters on a case clock. Each chapter has:
 *   - events: things that happen on real dates whether or not the player acts
 *   - actions ("leads"): things the player chooses to do; each costs days
 * Events and actions put files on the evidence board and people on the
 * suspect list. The player can accuse anyone on the suspect list at any time;
 * the accusation plays out to sentencing, then the truth is revealed.
 *
 * Facts must be checkable against the case sources. People who were
 * investigated and cleared get changed names; tip-line suspects are composites.
 */
window.COLD_READ_CASES = [
  {
    id: "btk",
    title: "The BTK Investigation",
    place: "Wichita, Kansas",
    yearsOpen: 31,
    tagline: "Ten murders. Taunting letters. Thirty-one years.",
    summary:
      "A killer in Wichita murders a family of four, then writes to the newspaper to take credit. Over the next three decades he kills again, names himself, goes silent, and returns. Read the files, choose your leads, and make an arrest when you're sure.",
    culprit: "rader",
    caseStart: "1974-01-15",
    realArrest: "2005-02-25",
    par: { steps: 4, days: 4 },
    coldDate: "2006-12-31",

    chapters: [
      { id: "c1", n: 1, title: "The Otero House", start: "1974-01-15", intro: "Wichita, January 1974. A 15-year-old comes home from school and finds his family dead." },
      { id: "c2", n: 2, title: "A Name for Himself", start: "1977-03-17", intro: "Three years of quiet. Then a mother of three is killed while her children are locked in a bathroom." },
      { id: "c3", n: 3, title: "The Quiet Years", start: "1984-06-01", intro: "BTK hasn't written since 1979. A new task force reopens every file. Meanwhile, women are still being strangled around Wichita." },
      { id: "c4", n: 4, title: "He Writes Again", start: "2004-03-19", intro: "Thirty years after the Otero murders, an envelope lands on a reporter's desk." }
    ],

    files: {
      /* ---------- Chapter 1 ---------- */
      otero_scene: {
        type: "report", chapter: "c1", date: "1974-01-15", from: "Wichita Police Department",
        title: "Homicide report: the Otero house",
        fields: [
          ["Victims", "Joseph Otero, 38 · Julie Otero, 34 · Josephine, 11 · Joseph II, 9"],
          ["Found by", "Charlie Otero, 15, and two siblings, after school"],
          ["Cause", "Strangulation. All four bound with cord."],
          ["Entry", "No forced entry. No sign of a struggle or robbery."]
        ],
        body: [
          "A neighbor who came to help tried to phone police and found the house's phone line had been cut outside.",
          "The father's wristwatch is missing. The mother's purse was emptied. The family car is gone.",
          "Biological evidence was collected at the scene and is being preserved."
        ]
      },
      otero_neighbors: {
        type: "statement", chapter: "c1", date: "1974-01-16", from: "Canvass notes",
        title: "Neighbors: a man drove off in the Oteros' car",
        body: [
          "Neighbors saw a man leave the house in the family's car that morning.",
          "Descriptions are vague. A composite sketch is drawn from what they remember."
        ]
      },
      otero_car: {
        type: "lab", chapter: "c1", date: "1974-01-20", from: "Crime scene unit",
        title: "Vehicle processing: Otero family car",
        fields: [["Recovered", "Parking lot near a Dillons grocery store"], ["Result", "Nothing found that identifies the driver"]],
        body: ["Whoever left the car there walked away. Nobody saw where he went."]
      },
      otero_kids: {
        type: "statement", chapter: "c1", date: "1974-01-18", from: "Interview notes",
        title: "Interview: the surviving Otero children",
        body: [
          "The three older children came home from school to find their parents and younger siblings dead.",
          "Detectives look hard for anyone with a grudge against the family. No suspect comes out of it."
        ]
      },
      bright_scene: {
        type: "report", chapter: "c1", date: "1974-04-04", from: "Wichita Police Department",
        title: "Homicide report: Kathryn Bright, 21",
        fields: [["Victim", "Kathryn Bright, 21, stabbed"], ["Survivor", "Her brother Kevin, shot twice"], ["Suspect status", "Fled before police arrived"]],
        body: [
          "A man was waiting inside when Kathryn and her brother Kevin came home. He said he was a fugitive and needed their car.",
          "Kevin was shot twice but escaped, and a passing driver took him to the hospital."
        ]
      },
      bright_kevin: {
        type: "statement", chapter: "c1", date: "1974-04-10", from: "Hospital interview",
        title: "Statement: Kevin Bright",
        body: [
          "Kevin describes the man who shot him. It's the best description investigators have, but it doesn't match anyone they can find.",
          "Nobody connects this case to the Otero murders yet."
        ]
      },
      confession: {
        type: "clipping", chapter: "c1", date: "1974-10-01", from: "Local press",
        title: "Young man says he and two friends killed the Oteros",
        body: [
          "A young man has told authorities he killed the Otero family with two friends. All three are being held.",
          "Police have not said whether his account matches the evidence."
        ]
      },
      confession_interview: {
        type: "statement", chapter: "c1", date: "1974-10-05", from: "Interrogation notes",
        title: "Interrogation: Wade Pruitt",
        body: [
          "Pruitt repeats his story, but detectives can't tie it to any of the physical evidence from the house.",
          "He wants to talk about the case. He has little to say about how it was done."
        ]
      },
      library_call: {
        type: "phone", chapter: "c1", date: "1974-10-22", from: "The Wichita Eagle",
        title: "Anonymous call to the Eagle",
        body: [
          "A man phones an editor at The Wichita Eagle. He says a letter about the Otero murders is hidden in a mechanical-engineering book at the Wichita Public Library.",
          "He hangs up before the call can be traced."
        ]
      },
      library_letter: {
        type: "letter", chapter: "c1", date: "1974-10-22", from: "Recovered from library book",
        title: "The letter in the library book",
        body: [
          "Typed. It describes the Otero killings in detail that wasn't public, details only the killer would know.",
          "It says the three men in custody are lying to get publicity and had nothing to do with it.",
          "It warns he will kill again, and it gives police his code words: bind them, torture them, kill them. B.T.K."
        ]
      },

      /* ---------- Chapter 2 ---------- */
      vian_scene: {
        type: "report", chapter: "c2", date: "1977-03-17", from: "Wichita Police Department",
        title: "Homicide report: Shirley Vian, 24",
        fields: [["Victim", "Shirley Vian, 24, bound and strangled"], ["Witnesses", "Her three young children"]],
        body: [
          "Her 5-year-old son let a stranger into the house. The man locked the three children in the bathroom.",
          "The children got out after he left."
        ]
      },
      vian_kids: {
        type: "statement", chapter: "c2", date: "1977-03-20", from: "Interview notes",
        title: "What the Vian children saw",
        body: ["The children describe a man, but they're small and frightened. The description is too vague to work with."]
      },
      fox_scene: {
        type: "report", chapter: "c2", date: "1977-12-08", from: "Wichita Police Department",
        title: "Homicide report: Nancy Fox, 25",
        fields: [["Victim", "Nancy Fox, 25, bound and strangled"], ["Phone line", "Cut"], ["Reported by", "The killer"]],
        body: ["The killer called the police himself to report it. The dispatch call was recorded."]
      },
      fox_call: {
        type: "phone", chapter: "c2", date: "1977-12-08", from: "Police dispatch log",
        title: "Dispatch log: caller reports a homicide",
        fields: [["Caller", "Male, calm, would not give a name"], ["Message", "“You will find a homicide at 843 South Pershing.”"]],
        body: ["The call was made from a pay phone. The recording is on file."]
      },
      payphone: {
        type: "report", chapter: "c2", date: "1977-12-10", from: "Patrol",
        title: "Pay phone traced",
        body: ["Officers find the pay phone the call came from. By the time anyone gets there, the caller is long gone. No witness can describe him."]
      },
      poem_card: {
        type: "letter", chapter: "c2", date: "1978-01-31", from: "The Wichita Eagle, classifieds desk",
        title: "An index card with a poem",
        body: [
          "A card with a nursery-rhyme-style poem about Shirley arrives at the Eagle. A mail clerk thinks it's a Valentine's Day ad and sends it to classifieds.",
          "Nobody realizes for days that it's about the Vian murder."
        ]
      },
      kake_letter: {
        type: "letter", chapter: "c2", date: "1978-02-10", from: "KAKE-TV",
        title: "Letter to KAKE-TV",
        body: [
          "The writer claims the Vian and Fox murders and an earlier victim, and complains that the press is ignoring him.",
          "He asks how many people he has to kill before he gets his name in the paper, and suggests names for himself. He signs it BTK.",
          "Police Chief Richard LaMunyon goes on air to warn Wichita that a serial killer is at large."
        ]
      },
      williams: {
        type: "report", chapter: "c2", date: "1979-04-28", from: "Wichita Police Department",
        title: "Report: intruder waited for a 63-year-old woman",
        body: [
          "Someone broke into Anna Williams' home and waited for her. She came home late, and he was gone.",
          "Weeks later she got some of her own belongings in the mail with a poem about the near miss. It's BTK."
        ]
      },
      tape_release: {
        type: "clipping", chapter: "c2", date: "1979-08-14", from: "Wichita media",
        title: "Police play the killer's voice on radio and TV",
        body: [
          "The 1977 dispatch recording is broadcast so the public can try to recognize the voice.",
          "More than 100 tips come in on the first day."
        ]
      },
      tape_tips: {
        type: "report", chapter: "c2", date: "1979-09-15", from: "Tip desk",
        title: "Voice-tape tips: summary",
        body: ["Detectives work through the tips. Several callers name a coworker or neighbor who 'sounds just like him.' One name comes up more than once."]
      },
      lund_check: {
        type: "statement", chapter: "c2", date: "1979-10-01", from: "Interview notes",
        title: "Interview: Gary Lund",
        body: ["Lund is cooperative and nervous. He has no solid alibi for the nights in question, but nothing else ties him to any victim."]
      },

      /* ---------- Chapter 3 ---------- */
      ghostbusters: {
        type: "memo", chapter: "c3", date: "1984-06-01", from: "Office of the Chief",
        title: "Memo: new BTK task force",
        body: [
          "A small team is assigned to reopen every BTK file. Around the department they're nicknamed the Ghostbusters.",
          "Their priority is preserving the physical evidence from the 1970s scenes for future testing."
        ]
      },
      hedge: {
        type: "report", chapter: "c3", date: "1985-05-05", from: "Sedgwick County",
        title: "Homicide report: Marine Hedge, 53",
        fields: [["Taken from", "Her home in Park City, a suburb north of Wichita"], ["Found", "Eight days later, strangled"]],
        body: ["No letter, no call. The case is not linked to BTK."]
      },
      wegerle: {
        type: "report", chapter: "c3", date: "1986-09-16", from: "Wichita Police Department",
        title: "Homicide report: Vicki Wegerle, 28",
        fields: [["Victim", "Vicki Wegerle, 28, strangled at home"], ["Found by", "Her husband, home for lunch"], ["Also present", "Their 2-year-old son, unharmed"]],
        body: [
          "There are signs she fought back. Material was collected from under her fingernails.",
          "No letter, no call. The case is not linked to BTK."
        ]
      },
      husband: {
        type: "statement", chapter: "c3", date: "1986-09-20", from: "Interview notes",
        title: "Interview: Tom Wegerle",
        body: [
          "He says he came home for lunch and found his son alone and his wife dead.",
          "With no other strong lead, he becomes the main suspect. He insists he's innocent."
        ]
      },
      parolees: {
        type: "report", chapter: "c3", date: "1986-11-15", from: "Task force",
        title: "Records check: men released from prison",
        body: [
          "Theory: BTK went quiet because he was locked up. The team pulls men released from Kansas prisons who were inside during the gap.",
          "One man's dates fit."
        ]
      },
      pike: {
        type: "statement", chapter: "c3", date: "1986-12-01", from: "Interview notes",
        title: "Interview: Donald Pike",
        body: ["Pike served time for burglary from 1979 to 1985. He lived in Wichita in the 1970s. He denies everything and has no alibi for 1974."]
      },
      davis: {
        type: "report", chapter: "c3", date: "1991-02-01", from: "Sedgwick County",
        title: "Homicide report: Dolores Davis, 62",
        fields: [["Entry", "Sliding glass door broken with a cinder block"], ["Found", "By a bridge, near Park City"]],
        body: ["No letter, no call. The case is not linked to BTK."]
      },
      pattern: {
        type: "memo", chapter: "c3", date: "1991-03-01", from: "Task force",
        title: "Pattern review: recent strangulations",
        body: ["The team compares Hedge, Wegerle and Davis against the 1970s cases. Nothing is distinctive enough to say they're BTK."]
      },

      /* ---------- Chapter 4 ---------- */
      killman: {
        type: "letter", chapter: "c4", date: "2004-03-19", from: "The Wichita Eagle",
        title: "Envelope from 'Bill Thomas Killman'",
        fields: [["Return name", "Bill Thomas Killman"], ["Postmark", "Wichita"]],
        body: [
          "One sheet of paper: three photos of Vicki Wegerle after her death, and a photocopy of her driver's license.",
          "Her family says the license was the only thing missing from the house in 1986. Detectives say the letter is genuine."
        ]
      },
      envelope_lab: {
        type: "lab", chapter: "c4", date: "2004-03-30", from: "Crime lab",
        title: "Lab: Killman envelope",
        body: ["The envelope and page are processed for prints and DNA. Nothing from them points to a name."]
      },
      puzzle: {
        type: "letter", chapter: "c4", date: "2004-05-05", from: "KAKE-TV",
        title: "Package to KAKE: puzzle and fake ID",
        body: [
          "A fake ID, a list of chapter titles for a 'BTK story,' and a grid of letters.",
          "There's no BTK signature, but police treat it as his."
        ]
      },
      tipline: {
        type: "report", chapter: "c4", date: "2004-05-20", from: "Tip desk",
        title: "BTK hotline: tip summary",
        body: [
          "Hundreds of tips come in after the Killman letter is made public.",
          "One caller insists a neighbor fits: an older man, retired, lives alone, keeps an old typewriter, and 'acts strange around women.'"
        ]
      },
      brenner: {
        type: "statement", chapter: "c4", date: "2004-06-01", from: "Interview notes",
        title: "Interview: Carl Brenner",
        body: ["Brenner, 63, is a retired aircraft worker. He owns a typewriter. He refuses a DNA swab on principle and asks for a lawyer."]
      },
      murdock: {
        type: "report", chapter: "c4", date: "2004-12-13", from: "Wichita Police Department",
        title: "Bag found in Murdock Park",
        body: [
          "A man finds a garbage bag in the park. Inside: Nancy Fox's driver's license from 1977 and a doll with its hands tied.",
          "BTK is keeping trophies, and he wants police to know."
        ]
      },
      postcard: {
        type: "letter", chapter: "c4", date: "2005-01-25", from: "KAKE-TV",
        title: "Postcard to KAKE",
        body: [
          "It leads police to a cereal box on a road outside Wichita, with another BTK message inside.",
          "The postcard also asks: did they get the box he left at the Home Depot?"
        ]
      },
      homedepot: {
        type: "note", chapter: "c4", date: "2005-01-26", from: "Recovered from Home Depot trash",
        title: "Note in the cereal box",
        body: [
          "A Home Depot employee found a cereal box in the back of his pickup and threw it out. Police dig it out of the trash.",
          "Inside, BTK asks: can he send police a floppy disk without it being traced to a computer? He asks them to be honest.",
          "If the answer is yes, they should place a newspaper ad in the Eagle that says: “Rex, it will be OK.”"
        ]
      },
      cctv: {
        type: "video", chapter: "c4", date: "2005-01-28", from: "Home Depot security video",
        title: "Security video: the drop-off",
        body: [
          "A vehicle pulls up beside the employee's pickup and leaves a minute later.",
          "The footage is too poor to show a face or a plate. The vehicle is a dark Jeep Cherokee."
        ]
      },
      ad: {
        type: "clipping", chapter: "c4", date: "2005-01-28", from: "The Wichita Eagle, classifieds",
        title: "Classified ad: “Rex, it will be ok”",
        body: [
          "The ad runs in the Eagle, placed with help from an undercover detective.",
          "It tells BTK what he wants to hear. It isn't true."
        ]
      },
      ad_confirm: {
        type: "letter", chapter: "c4", date: "2005-02-03", from: "KAKE-TV",
        title: "Postcard: he saw the ad",
        body: ["Six days later, another postcard to KAKE. BTK says he saw the ad."]
      },
      disk_arrives: {
        type: "report", chapter: "c4", date: "2005-02-16", from: "KSAS-TV",
        title: "Package to KSAS-TV: a floppy disk",
        body: ["KSAS-TV receives a padded envelope with a floppy disk inside. The only visible file is a short message from BTK."]
      },
      disk_forensics: {
        type: "disk", chapter: "c4", date: "2005-02-17", from: "Digital forensics",
        title: "Forensics: deleted file on the disk",
        fields: [
          ["Recovered", "A deleted Word document"],
          ["Last modified by", "Dennis"],
          ["Organization", "Christ Lutheran Church"],
          ["Also used at", "Park City Library"]
        ],
        body: ["The disk had been used before. A deleted file's properties are still readable."]
      },
      church: {
        type: "web", chapter: "c4", date: "2005-02-17", from: "christ lutheran church website",
        title: "Christ Lutheran Church: congregation council",
        fields: [["Council president", "Dennis Rader"]],
        body: ["The church's website lists its leadership. There's one Dennis."]
      },
      rader_bg: {
        type: "report", chapter: "c4", date: "2005-02-18", from: "Records check",
        title: "Background: Dennis Rader",
        fields: [
          ["Age", "59"],
          ["Home", "Park City"],
          ["Job", "City compliance officer, Park City, since 1991"],
          ["Past jobs", "ADT home-security installer; Coleman Company"],
          ["Other", "Air Force veteran · Cub Scout leader · married, two adult children"]
        ],
        body: ["Marine Hedge was taken from a house in Park City in 1985. Dolores Davis was found near Park City in 1991."]
      },
      rader_jeep: {
        type: "report", chapter: "c4", date: "2005-02-19", from: "Vehicle records",
        title: "Vehicle check: Rader",
        body: ["Rader has access to a black Jeep Cherokee, the same type of vehicle seen in the Home Depot video."]
      },
      dna: {
        type: "lab", chapter: "c4", date: "2005-02-24", from: "Kansas Bureau of Investigation",
        title: "DNA comparison: familial sample",
        fields: [["Sample", "Pap smear taken years earlier from Rader's daughter at a university clinic, obtained by warrant"], ["Compared to", "Crime-scene DNA preserved by the task force"], ["Result", "Familial match. The killer is her father."]],
        body: ["Investigators confirm it without tipping Rader off."]
      }
    },

    suspects: {
      pruitt: { name: "Wade Pruitt", note: "Confessed to the Otero murders with two friends." , innocent: "Wade Pruitt is a changed name. The real young man's confession was false, and he and his friends had nothing to do with the murders. BTK's own October 1974 letter said so." },
      lund: { name: "Gary Lund", note: "Named by several callers after the voice tape was broadcast.", innocent: "Gary Lund is a composite of the many people named in tips after the 1979 voice broadcast. None of those tips led anywhere." },
      tomw: { name: "Tom Wegerle", note: "Husband of Vicki Wegerle. Found her body.", innocent: "Tom Wegerle is a changed name. Vicki's real husband lived under suspicion for 18 years. BTK's 2004 letter, and later the DNA under her fingernails, cleared him." },
      pike: { name: "Donald Pike", note: "Paroled in 1985 after six years inside. Dates fit the gap.", innocent: "Donald Pike is a composite. The theory that BTK had been in prison during his silence was a real lead, and it went nowhere." },
      brenner: { name: "Carl Brenner", note: "Retired, lives alone, owns a typewriter. Named by a hotline caller.", innocent: "Carl Brenner is a composite of the thousands of hotline tips in 2004. None of them identified BTK." },
      rader: { name: "Dennis Rader", note: "Church council president. First name matches the disk." }
    },

    events: [
      { id: "e_otero", chapter: "c1", date: "1974-01-15", headline: "Family of four found slain in east Wichita", files: ["otero_scene"], flags: ["otero"] },
      { id: "e_bright", chapter: "c1", date: "1974-04-04", headline: "Woman killed, brother shot in home invasion", files: ["bright_scene"], flags: ["bright"] },
      { id: "e_confess", chapter: "c1", date: "1974-10-01", headline: "Young man confesses to Otero murders", files: ["confession"], suspects: ["pruitt"], flags: ["confess"] },
      { id: "e_call", chapter: "c1", date: "1974-10-22", headline: "Caller says the killer left a letter in a library book", files: ["library_call"], flags: ["libcall"] },

      { id: "e_vian", chapter: "c2", date: "1977-03-17", headline: "Mother strangled while children locked in bathroom", files: ["vian_scene"], flags: ["vian"] },
      { id: "e_fox", chapter: "c2", date: "1977-12-08", headline: "Killer phones police to report his own crime", files: ["fox_scene", "fox_call"], flags: ["fox"] },
      { id: "e_poem", chapter: "c2", date: "1978-01-31", headline: "Strange poem arrives at the Eagle", files: ["poem_card"] },
      { id: "e_kake", chapter: "c2", date: "1978-02-10", headline: "Chief: a serial killer is loose in Wichita", files: ["kake_letter"], flags: ["kake"] },
      { id: "e_williams", chapter: "c2", date: "1979-04-28", headline: "Intruder waited for woman, then mailed her a poem", files: ["williams"] },

      { id: "e_ghost", chapter: "c3", date: "1984-06-01", headline: "New task force reopens BTK files", files: ["ghostbusters"] },
      { id: "e_hedge", chapter: "c3", date: "1985-05-05", headline: "Park City woman found dead", files: ["hedge"] },
      { id: "e_wegerle", chapter: "c3", date: "1986-09-16", headline: "Young mother strangled; husband questioned", files: ["wegerle"], suspects: ["tomw"], flags: ["wegerle"] },
      { id: "e_davis", chapter: "c3", date: "1991-02-01", headline: "Retiree found dead near Park City", files: ["davis"], flags: ["davis"] },

      { id: "e_killman", chapter: "c4", date: "2004-03-19", headline: "BTK is back: letter claims 1986 murder", files: ["killman"], flags: ["killman"] },
      { id: "e_puzzle", chapter: "c4", date: "2004-05-05", headline: "Puzzle and fake ID mailed to KAKE", files: ["puzzle"], flags: ["puzzle"] },
      { id: "e_murdock", chapter: "c4", date: "2004-12-13", headline: "Victim's 1977 license found in park", files: ["murdock"] },
      { id: "e_postcard", chapter: "c4", date: "2005-01-25", headline: "Postcard leads police to a cereal box", files: ["postcard"], flags: ["postcard"] },
      { id: "e_adconfirm", chapter: "c4", after: { flag: "ad", days: 6 }, headline: "BTK: 'I saw the ad'", files: ["ad_confirm"] },
      { id: "e_disk", chapter: "c4", after: { flag: "ad", days: 19 }, headline: "TV station receives a floppy disk", files: ["disk_arrives"], flags: ["disk"] }
    ],

    actions: [
      { id: "a_canvass", chapter: "c1", label: "Canvass the neighborhood", days: 2, requires: ["otero"], files: ["otero_neighbors"] },
      { id: "a_car", chapter: "c1", label: "Process the family car", days: 5, requires: ["otero"], files: ["otero_car"] },
      { id: "a_kids", chapter: "c1", label: "Interview the Otero children", days: 3, requires: ["otero"], files: ["otero_kids"] },
      { id: "a_kevin", chapter: "c1", label: "Interview the surviving brother", days: 4, requires: ["bright"], files: ["bright_kevin"] },
      { id: "a_pruitt", chapter: "c1", label: "Interrogate the man who confessed", days: 4, requires: ["confess"], files: ["confession_interview"] },
      { id: "a_library", chapter: "c1", label: "Go to the library and find the book", days: 1, requires: ["libcall"], files: ["library_letter"] },

      { id: "a_viankids", chapter: "c2", label: "Interview the Vian children", days: 3, requires: ["vian"], files: ["vian_kids"] },
      { id: "a_payphone", chapter: "c2", label: "Trace the pay phone", days: 2, requires: ["fox"], files: ["payphone"] },
      { id: "a_tape", chapter: "c2", label: "Broadcast the killer's voice", days: 30, requires: ["kake"], files: ["tape_release", "tape_tips"], suspects: ["lund"], flags: ["tape"] },
      { id: "a_lund", chapter: "c2", label: "Bring in the man callers named", days: 5, requires: ["tape"], files: ["lund_check"] },

      { id: "a_husband", chapter: "c3", label: "Re-interview Vicki Wegerle's husband", days: 4, requires: ["wegerle"], files: ["husband"] },
      { id: "a_parole", chapter: "c3", label: "Check men released from prison", days: 60, requires: [], files: ["parolees", "pike"], suspects: ["pike"] },
      { id: "a_pattern", chapter: "c3", label: "Compare recent stranglings to BTK", days: 20, requires: ["davis"], files: ["pattern"] },

      { id: "a_envelope", chapter: "c4", label: "Test the Killman envelope for prints and DNA", days: 11, requires: ["killman"], files: ["envelope_lab"] },
      { id: "a_tipline", chapter: "c4", label: "Work the hotline tips", days: 30, requires: ["killman"], files: ["tipline", "brenner"], suspects: ["brenner"] },
      { id: "a_homedepot", chapter: "c4", label: "Search the Home Depot for the box", days: 1, requires: ["postcard"], files: ["homedepot"], flags: ["note"] },
      { id: "a_cctv", chapter: "c4", label: "Pull the Home Depot security video", days: 3, requires: ["note"], files: ["cctv"], flags: ["cctv"] },
      { id: "a_ad", chapter: "c4", label: "Place the ad in the Eagle", days: 1, requires: ["note"], files: ["ad"], flags: ["ad"] },
      { id: "a_forensics", chapter: "c4", label: "Send the disk to digital forensics", days: 1, requires: ["disk"], files: ["disk_forensics"], flags: ["meta"] },
      { id: "a_church", chapter: "c4", label: "Look up Christ Lutheran Church", days: 1, requires: ["meta"], files: ["church"], suspects: ["rader"], flags: ["rader"] },
      { id: "a_bg", chapter: "c4", label: "Run a background check on Rader", days: 1, requires: ["rader"], files: ["rader_bg"] },
      { id: "a_jeep", chapter: "c4", label: "Check what Rader drives", days: 1, requires: ["rader", "cctv"], files: ["rader_jeep"] },
      { id: "a_dna", chapter: "c4", label: "Get a warrant for a family DNA sample", days: 5, requires: ["rader"], files: ["dna"], flags: ["dna"] }
    ],

    culpritOutcome: [
      { offset: 0, title: "Arrest", text: "Officers pull Rader over as he drives home for lunch." },
      { offset: 0, title: "Interrogation", text: "Shown the DNA evidence, he confesses. He's angry the police lied about the disk." },
      { offset: 1, title: "Charges", text: "Charged with 10 counts of first-degree murder." },
      { offset: 122, title: "Plea", text: "On the first day of trial he pleads guilty to all 10 counts and describes each killing in court." },
      { offset: 174, title: "Sentence", text: "Ten consecutive life terms, a minimum of 175 years. Kansas had no death penalty when he killed." }
    ],
    wrongOutcome: [
      { offset: 0, title: "Arrest", text: "{name} is taken into custody." },
      { offset: 2, title: "Charges", text: "Prosecutors charge {name} with first-degree murder." },
      { offset: 240, title: "Trial", text: "The jury hears your case for two weeks. {name} maintains his innocence." },
      { offset: 255, title: "Verdict", text: "Guilty." },
      { offset: 300, title: "Sentence", text: "Life in prison." }
    ],

    truth: [
      "BTK was Dennis Rader, a church council president, Cub Scout leader and city compliance officer in Park City.",
      "He was caught in February 2005 after police told him a floppy disk couldn't be traced. A deleted file on it named his church and the user 'Dennis.'",
      "His daughter's DNA, taken years earlier at a university clinic, confirmed the match. He was arrested February 25, 2005, pleaded guilty June 27, and was sentenced August 18, 2005 to 10 consecutive life terms."
    ],
    missed: "A puzzle he mailed to KAKE in May 2004 had the letters R-A-D-E-R and his house number, 6220, hidden in its grid. Nobody spotted it until after his arrest.",

    victims: [
      { name: "Joseph Otero", date: "1974-01-15" },
      { name: "Julie Otero", date: "1974-01-15" },
      { name: "Josephine Otero", date: "1974-01-15" },
      { name: "Joseph Otero II", date: "1974-01-15" },
      { name: "Kathryn Bright", date: "1974-04-04" },
      { name: "Shirley Vian", date: "1977-03-17" },
      { name: "Nancy Fox", date: "1977-12-08" },
      { name: "Marine Hedge", date: "1985-04-27" },
      { name: "Vicki Wegerle", date: "1986-09-16" },
      { name: "Dolores Davis", date: "1991-01-19" }
    ],
    sources: [
      { title: "Biography: BTK Killer timeline", url: "https://www.biography.com/crime/btk-killer-dennis-rader-timeline" },
      { title: "Officer.com: How to catch a criminal (BTK)", url: "https://www.officer.com/investigations/article/21240158/how-to-catch-a-criminal-loose-lips-and-ligature" },
      { title: "Crime Library: The Otero murders", url: "https://crimelibrary.org/serial_killers/unsolved/btk/discovery_2.html" },
      { title: "Crime+Investigation: BTK investigation", url: "https://www.crimeandinvestigation.co.uk/crime-files/dennis-rader-the-btk-killer/investigation" },
      { title: "Fox News: BTK timeline", url: "https://www.foxnews.com/story/raw-data-btk-timeline" },
      { title: "NBC News: Kansas serial killer resurfaces (2004)", url: "https://www.nbcnews.com/id/wbna4615264" },
      { title: "Oxygen: How a floppy disk exposed the BTK killer", url: "https://www.oxygen.com/snapped/crime-time/floppy-disk-exposed-dennis-rader-btk-killer" },
      { title: "A&E: Case File — Dennis Rader", url: "https://www.aetv.com/articles/dennis-rader" }
    ]
  }
];
