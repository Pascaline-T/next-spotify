import { NextPage, GetServerSidePropsContext } from "next";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import Cookies from "cookies";
import useSWR from "swr";
import { Layout } from "../components/Layout";
import React from "react";
import { SpotifyState, SpotifyUser } from "../types/spotify";
import { access } from "fs";

interface Props {
  user: SpotifyUser;
  accessToken: string;
}

const play = (accessToken: string, deviceId: string, position: number) => {
  return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      uris: ["spotify:track:1lCRw5FEZ1gPDNPzy1K4zW"],
      position_ms: position, //started at "x" ms
    }),
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

const Player: NextPage<Props> = ({ accessToken }) => {
  const { data, error } = useSWR("/api/get-user-info");
  const [paused, setPaused] = React.useState(true);
  const [currentTrack, setCurrentTrack] = React.useState("");
  const [deviceId, player] = useSpotifyPlayer(accessToken);
  const [position, setPosition] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  // const [vol, setvolume] = React.useState<number>(0);

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

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  const user = data;

  return (
    // <Layout isLoggedIn={true}>
    //   {/* <p> {user && user.display_name}</p> */}
    //   {/* <p>{currentTrack}</p> */}
    //   {/* <button
    //     onClick={() => {
    //       paused ? play(accessToken, deviceId, position) : pause(accessToken, deviceId);
    //     }}
    //   >
    //     {paused ? "Play" : "Pause"}
    //   </button>
    //   <p> */}
    //   {/* Not dynamic yet */}
    //   {/* Duration : {Math.round(position / 1000)} / {Math.floor(duration * 10 ** -3) / 60} */}
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
