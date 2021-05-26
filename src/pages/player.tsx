import { NextPage, GetServerSidePropsContext } from "next";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import Cookies from "cookies";
import useSWR from "swr";
import { Layout } from "../components/Layout";
import React, { useState } from "react";
import { SpotifyState, SpotifyTrack, SpotifyUser } from "../types/spotify";
import {
  play,
  resume,
  pause,
  previousTrack,
  nextTrack,
  volumeTrack,
  trackInfos,
} from "../components/Spotify-api-calls";


interface Props {
  user: SpotifyUser;
  accessToken: string;
}


////Component
const Player: NextPage<Props> = ({ accessToken }) => {
  const { data, error } = useSWR("/api/get-user-info");
  const [start, setStart] = React.useState<boolean>(false);
  const [paused, setPaused] = React.useState(true);
  // const [currentTrack, setCurrentTrack] = React.useState(""); //from boilerplate ; now "selectTrack"
  const [selectTrack, setSelectTrack] = React.useState<string[]>(["track", "0pLT0IT7xKaNlY4HvrWCx7"]);
  const [trackInfo, setTrackInfo] = React.useState<any[] | undefined>([""]);
  const [deviceId, player] = useSpotifyPlayer(accessToken);
  const [infosAlbum, setInfosAlbum] = React.useState<any>();
  const [selectAlbum, setSelectAlbum] = React.useState<string>("7zCODUHkfuRxsUjtuzNqbd");
  const [durTotal, setDurTotal] = React.useState<number>(0);
  const [position, setPosition] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);

  ////Player useEffect
  React.useEffect(() => {
    const playerStateChanged = (state: SpotifyState) => {
      setPaused(state.paused);
      // setCurrentTrack(state.track_window.current_track.name); //from boilerplate ; now "selectTrack"
      setTrackInfo([
        state.track_window.current_track.id, //string
        state.track_window.current_track.uri, //string
        state.track_window.current_track.type, //string
        state.track_window.current_track.name, //string
        state.track_window.current_track.duration_ms, //number
        state.track_window.current_track.artists[0].name, //string
        state.track_window.current_track.album.name, //string
      ]);
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


  //// selectTrack useEffect
  React.useEffect(() => {
    if (start) {
      pause(accessToken, deviceId);
      setStart(false);
      play(accessToken, deviceId, selectTrack[0], selectTrack[1]);
      setStart(true);
    }
  }, [selectTrack]);

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

      <h1>Player</h1>
      <h2>Welcome {user && user.display_name}</h2>
      <ul>
        <p>
          {trackInfo[3]} - {trackInfo[5]}
        </p>
        <p>{trackInfo[6]}</p>
      </ul>
      <ul>
        <button
          onClick={() => {
            previousTrack(accessToken, deviceId);
          }}
        >
          Previous
        </button>

        <button
          onClick={() => {
            paused
              ? start
                ? resume(accessToken, deviceId)
                : play(accessToken, deviceId, selectTrack[0], selectTrack[1])
              : pause(accessToken, deviceId);
            setStart(true);
          }}
        >
          {paused ? (start ? "Resume" : "Play") : "Pause"}
        </button>

        <button
          onClick={() => {
            nextTrack(accessToken, deviceId);
          }}
        >
          Next
        </button>
      </ul>

      <ul>
        <button
          onClick={() => {
            volumeTrack(accessToken, deviceId, 25);
          }}
        >
          Volume down
        </button>

        <button
          onClick={() => {
            volumeTrack(accessToken, deviceId, 50);
          }}
        >
          Volume up
        </button>
      </ul>
      {/* Not dynamic yet */}
      {/* Duration : {Math.round(position / 1000)} / {Math.floor(duration * 10 ** -3) / 60} */}

      <button
        onClick={() => {
          setSelectTrack(["track", "53qkkSKD3fQaZmzA2vGoo4"]);
        }}
      >
        Time traveler - Knower
      </button>

      <button
        onClick={() => {
          setSelectTrack(["track", "28CXe6HJBJYAFUFjHAqZ8U"]);
        }}
      >
        Everybody's a loser - I monster
      </button>
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
