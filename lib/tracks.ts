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
  youtubeListId: string;
}

// Playlist definitions — tracks are loaded dynamically from YouTube at runtime.
// To add/remove/reorder songs, just update your YouTube playlists directly.
export const PLAYLISTS: Playlist[] = [
  {
    id: "ghazals",
    name: "Ghazal Evenings",
    youtubeListId: "PLK4FtdgIFLYQ",
  },
  {
    id: "pop",
    name: "Pakistani Pop",
    youtubeListId: "PLHIETQTp5UV8",
  },
];
