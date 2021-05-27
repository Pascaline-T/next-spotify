export const play = (accessToken: string, deviceId: string, type: string, uris: string, position: number) => {
  if (type === "track") {
    return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        uris: [`spotify:track:${uris}`],
        offset: { position: position },
      }),
    });
  } else if (type === "album") {
    return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        context_uri: `spotify:album:${uris}`,
        offset: { position: position },
      }),
    });
  } else if (type === "playlist") {
    return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${uris}`,
        offset: { position: position },
      }),
    });
  }
};

export const pause = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const nextTrack = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const previousTrack = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const volume = (choice: boolean, currentVolume: number): number => {
  //// choice = true → "volume up"
  if (choice) {
    if (currentVolume <= 95) {
      return currentVolume + 5;
    } else {
      return currentVolume;
    }
  } else {
    if (currentVolume >= 5) {
      return currentVolume - 5;
    } else {
      return currentVolume;
    }
  }
};

export const volumeTrack = (accessToken: string, deviceId: string, volumePercent: number) => {
  return fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const currentPlayback = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player?device_id=${deviceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const trackInfos = (accessToken: string, id: string) => {
  return fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getAlbum = (accessToken: string, id: string) => {
  return fetch(`https://api.spotify.com/v1/albums/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getAlbumsForOneArtist = (accessToken: string, id: string) => {
  return fetch(`https://api.spotify.com/v1/artists/${id}/albums`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getPlaylist = (accessToken: string, deviceId: string, playlist_id: string) => {
  return fetch(`https://api.spotify.com/v1/playlists/${playlist_id}?device_id=${deviceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
