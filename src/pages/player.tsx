import { NextPage, GetServerSidePropsContext } from "next";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import Cookies from "cookies";
import useSWR from "swr";
import { Layout } from "../components/Layout";
import React from "react";
import { SpotifyState, SpotifyTrack, SpotifyUser } from "../types/spotify";
import {
  play,
  resume,
  pause,
  previousTrack,
  nextTrack,
  volumeTrack,
  currentPlayback,
  trackInfos,
  getAlbum,
  getAlbumsForOneArtist,
  getPlaylist,
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
  const [showAlbum, setShowAlbum] = React.useState<boolean>(false);
  const [selectTrack, setSelectTrack] = React.useState<any[]>(["track", "0pLT0IT7xKaNlY4HvrWCx7", 0]);
  const [trackInfo, setTrackInfo] = React.useState<any[] | undefined>([""]);
  const [deviceId, player] = useSpotifyPlayer(accessToken);
  const [infosAlbum, setInfosAlbum] = React.useState<any>(); // toutes les infos contenu dans album
  const [selectAlbum, setSelectAlbum] = React.useState<string>("7zCODUHkfuRxsUjtuzNqbd"); // le watcher album the weeknd
  const [albumsArtist, setAlbumsArtist] = React.useState<any>(); // toutes les infos contenus dans l'artist
  const [selectArtist, setSelectArtist] = React.useState<string>("1HY2Jd0NmPuamShAr6KMms");
  const [infosPlaylist, setInfosPlaylist] = React.useState<any>();
  const [durTotal, setDurTotal] = React.useState<number>(0);
  const [position, setPosition] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);

  ////Player useEffect
  React.useEffect(() => {
    const playerStateChanged = (state: SpotifyState) => {
      setPaused(state.paused);
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

  //// default album useEffect ; to be deleted
  // React.useEffect(() => {
  //   getAlbum(accessToken, selectAlbum)
  //     .then((nameAlbum) => nameAlbum.json())
  //     .then((result) => {
  //       setInfosAlbum(result);
  //     });
  // }, []);

  //// selectTrack useEffect
  React.useEffect(() => {
    if (start) {
      pause(accessToken, deviceId);
      setStart(false);
      play(accessToken, deviceId, selectTrack[0], selectTrack[1], selectTrack[2]);
      setStart(true);
    }
    // getPlaylist(accessToken, deviceId, "64gvpiwFO2rHEc4LZ36vdu")
    //   .then((response) => response.json())
    //   .then((result) => {
    //     setInfosPlaylist(result);
    //   });
  }, [selectTrack]);

  // useEffect for a selected album
  React.useEffect(() => {
    getAlbum(accessToken, selectAlbum)
      .then((nameAlbum) => nameAlbum.json())
      .then((result) => {
        setInfosAlbum(result);
      });
  }, [selectAlbum]);

  // useEffect for an artist's albums
  React.useEffect(() => {
    getAlbumsForOneArtist(accessToken, selectArtist)
      .then((albums) => albums.json())
      .then((result) => {
        setAlbumsArtist(result);
      });
  }, [selectArtist]);

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
                : play(accessToken, deviceId, selectTrack[0], selectTrack[1], selectTrack[2])
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
            volumeTrack(accessToken, deviceId, 75);
          }}
        >
          Volume up
        </button>
      </ul>
      {/* Not dynamic yet */}
      {/* Duration : {Math.round(position / 1000)} / {Math.floor(duration * 10 ** -3) / 60} */}

      {/* ALBUMS */}

      <div>
        <button
          onClick={() => {
            setShowAlbum(!showAlbum);
          }}
        >
          Album
        </button>
        <button
          onClick={() => {
            setShowAlbum(!showAlbum);
          }}
        >
          Discography
        </button>

        {showAlbum ? (
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
            </button>{" "}
            <p>
              <img src={infosAlbum.images[1].url} />
            </p>
            <p>Nom de l'album : {infosAlbum.name}</p>
            <p>Artiste : {infosAlbum.artists[0].name}</p>
            <p>Date de sortie : {infosAlbum.release_date}</p>
            <p>Nombre de piste : {infosAlbum.total_tracks}</p>
            {/* <p>Durée totale: {infosAlbum.tracks.items.map((track: SpotifyTrack) => { 
          return setDurTotal(durTotal + track.duration_ms)})}</p> */}
            <p>
              {infosAlbum.tracks.items.map((track: SpotifyTrack, index: number) => {
                return (
                  <ul>
                    {/* Faire le typage du temps de la musique */}
                    <li key={`${track.id}`}>
                      <button
                        onClick={() => {
                          setSelectTrack(["album", infosAlbum.id, index]);
                        }}
                      >
                        {track.name}
                      </button>
                      <p>Temps de la musique : {parseFloat(track.duration_ms / 60000).toFixed(2)}</p>
                    </li>
                  </ul>
                );
              })}
            </p>
          </div>
        ) : (
          ""
        )}

        {/* ARTIST ALBUMS */}

        <div>
          {!showAlbum ? (
            <div>
              <button
                onClick={() => {
                  return setSelectArtist("7lMgpN1tEBQKpRoUMKB8iw");
                }}
              >
                Artist 1 (black M)
              </button>
              <button
                onClick={() => {
                  return setSelectArtist("4lxfqrEsLX6N1N4OCSkILp");
                }}
              >
                Artist 2 (Phil collins)
              </button>
              <p>
                {albumsArtist.items.map((element: SpotifyTrack) => {
                  return (
                    <ul>
                      <li>
                        <img src={element.images[1].url} />
                        <br />
                        nom de l'album : {element.name} <br />
                        nombre total de musique : {element.total_tracks} <br />
                        type : {element.type} <br />
                        id : {element.id}
                      </li>
                    </ul>
                  );
                })}
              </p>
            </div>
          ) : (
            ""
          )}
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
