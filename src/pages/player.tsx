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
  })
    .then((result) => result.json())
    .then((play) => console.log(play));
};
const pause = (accessToken: string, deviceId: string) => {
  return fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
const getAlbums = async (accessToken: string, albumId: string) => {
  //console.log(albumId);
  return fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  // .then((nameAlbum) => nameAlbum.json())
  // .then((json) => {
  //   json.items.map((element: SpotifyTrack) => {
  //     console.log(element.uri);
  //     //setText(element.uri);
  //     const list = element.uri;
  //   });
  // });
};
const Player: NextPage<Props> = ({ accessToken }) => {
  const { data, error } = useSWR("/api/get-user-info");
  const [paused, setPaused] = React.useState(true);
  const [currentTrack, setCurrentTrack] = React.useState("");
  const [deviceId, player] = useSpotifyPlayer(accessToken);
  const [text, setText] = React.useState([]);

  //});
  React.useEffect(() => {
    const playerStateChanged = (state: SpotifyState) => {
      setPaused(state.paused);
      setCurrentTrack(state.track_window.current_track.name);
      getAlbums(accessToken, "1ATL5GLyefJaxhQzSPVrLX")
        .then((nameAlbum) => nameAlbum.json())
        .then((json) => {
          //   json.items.map((element: SpotifyTrack) => {
          //     //console.log(element.uri);
          setText(json.items);
        });
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
        <p>{text.map((element: SpotifyTrack) => element.uri)} </p>

        <div className="d-flex justify-content-start">
          <div className="w-25 p-3">
            <nav className="nav flex-column navbar-dark bg-dark">
              <a className="nav-link active" aria-current="page" href="#">
                Active
              </a>
              <a className="nav-link" href="#">
                Link
              </a>
              <a className="nav-link" href="#">
                Link
              </a>
              <a className="nav-link disabled" href="#" aria-disabled="true">
                Disabled
              </a>
            </nav>
          </div>
          <div className="myClass">
            <p>fffff</p>
          </div>
        </div>
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
