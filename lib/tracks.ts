export type Track = {
  id: string;
  title: string;
  artist: string;
  film?: string;
  year: number;
  duration: string; // MM:SS display format
  videoId: string;
};

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

export const PLAYLISTS: Playlist[] = [
  {
    id: "ghazals",
    name: "Ghazal Evenings",
    tracks: [
      {
        id: "ghazal-1",
        title: "Duniya Kisi Ke Pyar Mein",
        artist: "Mehdi Hassan",
        film: "Classic Ghazal",
        year: 1989,
        duration: "07:13",
        videoId: "IjTa4Yo6jj4" // From PLK4FtdgIFLYQ
      },
      {
        id: "ghazal-2",
        title: "Rafta Rafta",
        artist: "Mehdi Hassan",
        film: "Classic Film",
        year: 1990,
        duration: "05:27",
        videoId: "75VnN1dLA-Q" // From PLK4FtdgIFLYQ
      },
      {
        id: "ghazal-3",
        title: "Dil Jalane Ki Baat",
        artist: "Mehdi Hassan",
        film: "Traditional",
        year: 1987,
        duration: "06:12",
        videoId: "eIE4azF6Obs" // From PLK4FtdgIFLYQ
      },
      {
        id: "ghazal-4",
        title: "Khaas Khayal",
        artist: "Farida Khanum",
        film: "Traditional",
        year: 1988,
        duration: "04:12",
        videoId: "nw_YJLgKjQk" // From PLK4FtdgIFLYQ
      },
      {
        id: "ghazal-5",
        title: "Mohabbat Karne Wale",
        artist: "Farida Khanum",
        film: "Classic Archival",
        year: 1991,
        duration: "05:10",
        videoId: "k1MSUIGk4dc" // From PLK4FtdgIFLYQ
      }
    ]
  },
  {
    id: "pop",
    name: "Pakistani Pop",
    tracks: [
      {
        id: "pop-1",
        title: "Purani Jeans (Acoustic)",
        artist: "Ali Haider Tribute",
        film: "Nostalgia Pop",
        year: 1993,
        duration: "04:54",
        videoId: "b59h2L2Y2tI"
      },
      {
        id: "pop-2",
        title: "Dil Dil Pakistan (Retro)",
        artist: "Vital Signs Tribute",
        film: "National Pop",
        year: 1989,
        duration: "03:20",
        videoId: "vX9r-fWn888"
      },
      {
        id: "pop-3",
        title: "Sar Kiye Ye Pahar",
        artist: "Strings Cover",
        film: "Pop Rock",
        year: 1991,
        duration: "04:02",
        videoId: "kUq_Z1N0Eag"
      }
    ]
  }
];
