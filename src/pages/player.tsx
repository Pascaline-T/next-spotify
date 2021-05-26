import { NextPage, GetServerSidePropsContext } from "next";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import Cookies from "cookies";
import useSWR from "swr";
import { Layout } from "../components/Layout";
import React, { useState } from "react";
import { SpotifyState, SpotifyTrack, SpotifyUser } from "../types/spotify";

interface Props {
  user: SpotifyUser;
  accessToken: string;
}

const play = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      uris: ["spotify:track/0TlLq3lA83rQOYtrqBqSct"],
    }),
  });
};

const resume = (accessToken: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/play`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const pause = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const getAlbum = (accessToken: string, id: string) => {
  return fetch(`https://api.spotify.com/v1/albums/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const Player: NextPage<Props> = ({ accessToken }) => {
  const { data, error } = useSWR("/api/get-user-info");
  const [start, setStart] = React.useState<boolean>(false);
  const [paused, setPaused] = React.useState(true);
  const [currentTrack, setCurrentTrack] = React.useState("");
  const [deviceId, player] = useSpotifyPlayer(accessToken);
  const [infosAlbum, setInfosAlbum] = React.useState<any>();
  const [selectAlbum, setSelectAlbum] = React.useState<string>("7zCODUHkfuRxsUjtuzNqbd");
  const [durTotal, setDurTotal] = React.useState<number>(0);
  const [position, setPosition] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);

  React.useEffect(() => {
    const playerStateChanged = (state: SpotifyState) => {
      setPaused(state.paused);
      setCurrentTrack(state.track_window.current_track.name);
      setPosition(state.position);
      setDuration(state.duration);
    };

    if (player) {
      player.addListener("player_state_changed", playerStateChanged);
    }
    return () => {
      if (player) {
        player.removeListener("player_state_changed", playerStateChanged);
      }
    };
  }, [player]);

  React.useEffect(() => {
    getAlbum(accessToken, selectAlbum)
      .then((nameAlbum) => nameAlbum.json())
      .then((result) => {
        setInfosAlbum(result);
      });
  }, []);

  React.useEffect(() => {
    // console.log(selectAlbum)
    getAlbum(accessToken, selectAlbum)
      .then((nameAlbum) => nameAlbum.json())
      .then((result) => {
        setInfosAlbum(result);
      });
    // console.log(info)
  }, [selectAlbum]);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  const user = data;
  return (
    <Layout isLoggedIn={true}>
      <div className="container-fluid">
        <h1>Player</h1>
        <p>Welcome {user && user.display_name}</p>
        <p>Welcome </p>
        <p>{currentTrack}</p>
        <button
          onClick={() => {
            paused ? play(accessToken, deviceId) : pause(accessToken, deviceId);
          }}
        >
          {paused ? "play" : "stop"}
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            return setSelectAlbum("2noRn2Aes5aoNVsU6iWThc");
          }}
        >
          Album 1
        </button>
        <button
          onClick={() => {
            return setSelectAlbum("4sLtOBOzn4s3GDUv3c5oJD");
          }}
        >
          Album 2
        </button>
        <p>
          <img src={infosAlbum.images[1].url} />
        </p>
        <p>Type : {infosAlbum.album_type}</p>
        <p>Nom de l'album : {infosAlbum.name}</p>
        <p>Artiste : {infosAlbum.artists[0].name}</p>
        <p>Date de sortie : {infosAlbum.release_date}</p>
        <p>Nombre de piste : {infosAlbum.total_tracks}</p>
        {/* {/* <p>Durée totale: {infosAlbum.tracks.items.map((track: SpotifyTrack) => { 
          return setDurTotal(durTotal + track.duration_ms)})}</p> */}
        <p>
          {infosAlbum.tracks.items.map((track: SpotifyTrack) => {
            return (
              <ul>
                {/* Faire le typage du temps de la musique */}
                <li>
                  Nom de la musique : {track.name}
                  <p>Type : {track.type}</p>
                  <p>uri : {track.id}</p>
                  <p>Temps de la musique : {parseFloat(track.duration_ms / 60000).toFixed(2)}</p>
                </li>
              </ul>
            );
          })}
        </p>
      </div>
    </Layout>
  );
};

export default Player;

export const getServerSideProps = async (context: GetServerSidePropsContext): Promise<unknown> => {
  const cookies = new Cookies(context.req, context.res);
  const accessToken = cookies.get("spot-next");
  if (accessToken) {
    return { props: { accessToken } };
  } else {
    return {
      props: {},
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
};
