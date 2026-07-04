import json

# Raw data pulled from the current Google Sheet, with Greg Davis -> Greg Davies fix applied
raw_artists = """1,Aaron Weber
2,Adam Sandler
3,Akaash Singh
4,Andrew Schulz
5,Anita Renfroe
6,Angela Johnson-Reyes
7,Bert Kreischer
8,Bill Cosby
9,Bill Engvall
10,Jeff Foxworthy
11,Bob Saget
12,Brad Stine
13,Brad Williams
14,Bron Lewis
15,Chad Daniels
16,Chonda Pierce
17,Chris D'Elia
18,Christina P
19,Christopher Titus
20,Daniel Sloss
21,Daren Streblow
22,Drew Lynch
23,Dustin Nickerson
24,Gabriel Iglesias
25,Gina Brillon
26,Greg Davies
27,Henry Cho
28,Iliza Shlesinger
29,JB Ball
30,Jack Whitehall
31,James Acaster
32,Jeff Allen
33,Jeff Dye
34,Jen Brister
35,Jim Gaffigan
36,Jimmy Carr
37,Jo Koy
38,John Branyan
39,John Crist
40,John Mulaney
41,Jonnie W
42,Jose Sarduy
43,Josh Blue
44,Josh Wolf
45,K-Von
46,Kathleen Madigan
47,Kelsey Cook
48,Kenn Kington
49,Kevin Hart
50,Kevin James
51,Leanne Morgan
52,Matt Rife
53,Michael Ian Black
54,Michael Jr
55,Michael McIntyre
56,Mike Birbiglia
57,Nate Bargatze
58,Norm Macdonald
59,Pete Holmes
60,Preacher Lawson
61,Ricky Gervais
62,Rob Schneider
63,Ron White
64,Russell Howard
65,Russell Peters
66,Sarah Millican
67,Shane Gillis
68,Tammy Pescatelli
69,Taylor Tomlinson
70,Theo Von
71,Tim Hawkins
72,Tom Papa
73,Tom Segura
74,Tommy Little
75,Trevor Noah
76,Zoltan Kaszas"""

# These had no ArtistID in the sheet yet - assign sequential IDs continuing from 76
unassigned_names = """Michael Yo
Sam Smith
Richard Villa
Kellen Erskine
Don McMillian
Monique Marvez
John Branyan
Aaron Woodall
Cam Bertrand
Brad Upton
Jose Sarduy
Matt Falk
Chris Martian
Myles Weber
John Hastings
Ben Braiard
Andy Woodhull
Drew Barth
Mike Paramore
Tyler Boeh
Steve Hoestetter
Gabriel Rutledge
Rex Havens
Robert G. Lee
Nick Guerra
Mke P Burton
Moddy Molavi
Leland Klassen
Karen Morgan
JJ Barrows
Jamie Lissow
Kabir Singh
Fred Klett
Dave Nihill
Dwayne Perkins
Cleto Rodriguez
Armando Anto
Heath Harmison
Steve Soelberg"""

artists = []

# Aaron Weber has a bio already
aaron_bio = ("Standup comedian based in Nashville, TN and a regular performer at the Grand Ole Opry — "
             "the youngest comic ever to perform in the Opry circle. Originally from Montgomery, Alabama, "
             "he graduated from Notre Dame before pursuing comedy full-time. Co-hosts The Nateland Podcast "
             "with Nate Bargatze and Brian Bates, and released his debut special \"Signature Dish\" "
             "(executive produced by Bargatze/Nateland Entertainment).")

for line in raw_artists.strip().split("\n"):
    aid, name = line.split(",", 1)
    artists.append({
        "ArtistID": int(aid),
        "Name": name.strip(),
        "Bio": aaron_bio if name.strip() == "Aaron Weber" else "",
        "PhotoURL": "",
        "WebsiteURL": ""
    })

next_id = max(a["ArtistID"] for a in artists) + 1
for name in unassigned_names.strip().split("\n"):
    artists.append({
        "ArtistID": next_id,
        "Name": name.strip(),
        "Bio": "",
        "PhotoURL": "",
        "WebsiteURL": ""
    })
    next_id += 1

with open("/home/claude/comedy-library/data/artists.json", "w") as f:
    json.dump(artists, f, indent=2)

with open("/home/claude/comedy-library/data/tags.json", "w") as f:
    json.dump([], f, indent=2)

with open("/home/claude/comedy-library/data/shorts.json", "w") as f:
    json.dump([], f, indent=2)

with open("/home/claude/comedy-library/data/specials.json", "w") as f:
    json.dump([], f, indent=2)

with open("/home/claude/comedy-library/data/special_lookup.json", "w") as f:
    json.dump([], f, indent=2)

print(f"Wrote {len(artists)} artists")
