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
  const [showTrackList, setShowTrackList] = React.useState<boolean>(false);
  const [selectTrack, setSelectTrack] = React.useState<any[]>(["track", "0pLT0IT7xKaNlY4HvrWCx7", 0]);
  const [trackInfo, setTrackInfo] = React.useState<any[] | undefined>([""]);
  const [deviceId, player] = useSpotifyPlayer(accessToken);
  const [infosAlbum, setInfosAlbum] = React.useState<any>(); // toutes les infos contenu dans album
  const [selectAlbum, setSelectAlbum] = React.useState<any>("7zCODUHkfuRxsUjtuzNqbd"); // le watcher album the weeknd
  const [albumsArtist, setAlbumsArtist] = React.useState<any>(); // toutes les infos contenus dans l'artist
  const [selectArtist, setSelectArtist] = React.useState<string>("1HY2Jd0NmPuamShAr6KMms");
  const [infosPlaylist, setInfosPlaylist] = React.useState<any>();
  const [durTotal, setDurTotal] = React.useState<number>(0);
  const [position, setPosition] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  // const [vol, setvolume] = React.useState<number>(0);

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
        state.track_window.current_track.album.images[2].url, //string
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
  React.useEffect(() => {
    getAlbum(accessToken, selectAlbum)
      .then((nameAlbum) => nameAlbum.json())
      .then((result) => {
        setInfosAlbum(result);
      });
    // getPlaylist(accessToken, deviceId, "64gvpiwFO2rHEc4LZ36vdu")
    //   .then((response) => response.json())
    //   .then((result) => {
    //     setInfosPlaylist(result);
    //   });
  }, []);

  //// selectTrack useEffect
  React.useEffect(() => {
    if (start) {
      pause(accessToken, deviceId);
      setStart(false);
      play(accessToken, deviceId, selectTrack[0], selectTrack[1], selectTrack[2]);
      setStart(true);
    }
    // currentPlayback(accessToken, deviceId)
    //   .then((response) => response.json())
    //   .then((result) => setCurrentPlayback(result));
  }, [selectTrack]);

  React.useEffect(() => {
    getAlbum(accessToken, selectAlbum)
      .then((nameAlbum) => nameAlbum.json())
      .then((result) => {
        setInfosAlbum(result);
      });
  }, [selectAlbum]);

  //// useffect pour les albums d'un artist
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

  //// ### RETURN ###
  return (
    <Layout isLoggedIn={true}>
      <nav className="sidebar"></nav>
      <div className="header">
        <div className="header--buttons">
          <button className="header--button previous">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-chevron-left"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
          </button>
          <button className="header--button next">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-chevron-right"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
        <div className="header--actions">
          <div className="header--search input-group has-left-icon has-right-icon can-delete">
            <span className="left-icon lni lni-search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </span>

            <form className="d-flex">
              <input
                className="form-control me-2 rounded-pill col-4"
                type="search"
                placeholder="                          Artistes, titres ou podcasts"
                aria-label="Search"
              />
            </form>
          </div>
        </div>

        {/* ACCOUNT */}
        <div>{user && user.display_name}</div>
      </div>

      {/* SIDEBAR */}

      <nav className="sidebar">
        <div className="brand">
          <svg viewBox="0 0 1134 340" className="spotify-logo--text">
            <title>Spotify</title>
            <path
              fill="currentColor"
              d="M8 171c0 92 76 168 168 168s168-76 168-168S268 4 176 4 8 79 8 171zm230 78c-39-24-89-30-147-17-14 2-16-18-4-20 64-15 118-8 162 19 11 7 0 24-11 18zm17-45c-45-28-114-36-167-20-17 5-23-21-7-25 61-18 136-9 188 23 14 9 0 31-14 22zM80 133c-17 6-28-23-9-30 59-18 159-15 221 22 17 9 1 37-17 27-54-32-144-35-195-19zm379 91c-17 0-33-6-47-20-1 0-1 1-1 1l-16 19c-1 1-1 2 0 3 18 16 40 24 64 24 34 0 55-19 55-47 0-24-15-37-50-46-29-7-34-12-34-22s10-16 23-16 25 5 39 15c0 0 1 1 2 1s1-1 1-1l14-20c1-1 1-1 0-2-16-13-35-20-56-20-31 0-53 19-53 46 0 29 20 38 52 46 28 6 32 12 32 22 0 11-10 17-25 17zm95-77v-13c0-1-1-2-2-2h-26c-1 0-2 1-2 2v147c0 1 1 2 2 2h26c1 0 2-1 2-2v-46c10 11 21 16 36 16 27 0 54-21 54-61s-27-60-54-60c-15 0-26 5-36 17zm30 78c-18 0-31-15-31-35s13-34 31-34 30 14 30 34-12 35-30 35zm68-34c0 34 27 60 62 60s62-27 62-61-26-60-61-60-63 27-63 61zm30-1c0-20 13-34 32-34s33 15 33 35-13 34-32 34-33-15-33-35zm140-58v-29c0-1 0-2-1-2h-26c-1 0-2 1-2 2v29h-13c-1 0-2 1-2 2v22c0 1 1 2 2 2h13v58c0 23 11 35 34 35 9 0 18-2 25-6 1 0 1-1 1-2v-21c0-1 0-2-1-2h-2c-5 3-11 4-16 4-8 0-12-4-12-12v-54h30c1 0 2-1 2-2v-22c0-1-1-2-2-2h-30zm129-3c0-11 4-15 13-15 5 0 10 0 15 2h1s1-1 1-2V93c0-1 0-2-1-2-5-2-12-3-22-3-24 0-36 14-36 39v5h-13c-1 0-2 1-2 2v22c0 1 1 2 2 2h13v89c0 1 1 2 2 2h26c1 0 1-1 1-2v-89h25l37 89c-4 9-8 11-14 11-5 0-10-1-15-4h-1l-1 1-9 19c0 1 0 3 1 3 9 5 17 7 27 7 19 0 30-9 39-33l45-116v-2c0-1-1-1-2-1h-27c-1 0-1 1-1 2l-28 78-30-78c0-1-1-2-2-2h-44v-3zm-83 3c-1 0-2 1-2 2v113c0 1 1 2 2 2h26c1 0 1-1 1-2V134c0-1 0-2-1-2h-26zm-6-33c0 10 9 19 19 19s18-9 18-19-8-18-18-18-19 8-19 18zm245 69c10 0 19-8 19-18s-9-18-19-18-18 8-18 18 8 18 18 18zm0-34c9 0 17 7 17 16s-8 16-17 16-16-7-16-16 7-16 16-16zm4 18c3-1 5-3 5-6 0-4-4-6-8-6h-8v19h4v-6h4l4 6h5zm-3-9c2 0 4 1 4 3s-2 3-4 3h-4v-6h4z"
            />
          </svg>
        </div>
        <div className="menu">
          {/* HOME BUTTON */}
          <div className="menu--item">
            <a href="#">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-house-door"
                viewBox="0 0 16 16"
              >
                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
              </svg>
              <i className="lni-home" /> <span className="menu--item--text">Home</span>
            </a>
          </div>
          {/* SEARCH BUTTON */}
          <div className="menu--item">
            <a href="#">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-search"
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
              <i className="lni-search" /> <span className="menu--item--text">Search</span>
            </a>
          </div>
          {/* LIBRARY BUTTON */}
          <div className="menu--item">
            <a href="#">
              <svg viewBox="0 0 512 512" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M291.301 81.778l166.349 373.587-19.301 8.635-166.349-373.587zM64 463.746v-384h21.334v384h-21.334zM192 463.746v-384h21.334v384h-21.334z"
                  fill="currentColor"
                ></path>
              </svg>
              <i className="lni-library" /> <span className="menu--item--text">Library</span>
            </a>
          </div>
        </div>

        {/* PLAYLIST BUTTON */}
        <p className="sidebar--header">PLAYLIST</p>
        <div className="menu menu-extra">
          <div className="menu--item">
            <a href="#">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-square"
                viewBox="0 0 16 16"
              >
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              <span className="menu--item--text">Create a playlist</span>
            </a>
          </div>
          {/* LIKED TITLEs */}
          <div className="menu--item">
            <a href="#">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-heart"
                viewBox="0 0 16 16"
              >
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />
              </svg>

              <span className="menu--item--text">Liked titles</span>
            </a>
          </div>
        </div>
        <div className="separator" />
        <br />

        {/* ARTISTS DROPDOWN */}
        <div className="dropdown">
          <a
            className="nav-link dropdown-toggle text-secondary"
            id="navbarDropdownMenuLink"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="text-secondary">Artists</span>
          </a>
          <ul className="dropdown-menu bg-dark" aria-labelledby="navbarDropdownMenuLink">
            <li
              className="btn btn-dark w-100"
              onClick={() => {
                setShowTrackList(false);
                setShowAlbum(true);
                setSelectArtist("7lMgpN1tEBQKpRoUMKB8iw");
              }}
            >
              <span className="menu--item--text">Black M</span>
            </li>
            <li
              className="btn btn-dark w-100"
              onClick={() => {
                setShowTrackList(false);
                setShowAlbum(true);
                setSelectArtist("4tZwfgrHOc3mvqYlEYSvVi");
              }}
            >
              <span className="menu--item--text">Daft punk</span>
            </li>
            <li
              className="btn btn-dark w-100"
              onClick={() => {
                setShowTrackList(false);
                setShowAlbum(true);
                setSelectArtist("1HY2Jd0NmPuamShAr6KMms");
              }}
            >
              <span className="menu--item--text">Lady Gaga</span>
            </li>
          </ul>
        </div>

        {/* FOOTER PLAYER */}
        <div className="fixed-bottom">
          <div className="sidebar--download-app">
            <a href="https://open.spotify.com/download">
              <i className="lni-arrow-down-circle" />
            </a>
          </div>
          <div className="bottom-bar">
            <div className="bottom-bar--left-col">
              <div className="bottom-bar--left-col--song">
                <div className="bottom-bar--left-col--song--img">
                  <div className="bottom-bar--left-col--song--img--pull-up">
                    <i className="lni lni-chevron-up" />
                  </div>
                  <img src={trackInfo[7]} alt="" />
                </div>

                {/* SONG DETAILS */}
                <div className="bottom-bar--left-col--song--details">
                  <div className="bottom-bar--left-col--song--details--wrapper">
                    <a href="#" className="bottom-bar--left-col--song--details--title">
                      {trackInfo[3]}
                    </a>
                  </div>
                  <div className="bottom-bar--left-col--song--details--wrapper">
                    <a href="#" className="bottom-bar--left-col--song--details--artist">
                      {trackInfo[5]}
                    </a>
                  </div>
                </div>
              </div>

              {/* TRACK LIKE BUTTON */}
              <div className="bottom-bar--left-col--actions">
                <button className="bottom-bar--left-col--actions--favorite">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-suit-heart"
                    viewBox="0 0 16 16"
                  >
                    <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                  </svg>
                </button>
                <button className="bottom-bar--left-col--actions--pip">
                  <i className="pip-icon" />
                </button>
              </div>
            </div>
            {/* PLAYER BUTTONS */}
            <p className="bt-play ">
              {/* PREVIOUS BUTTON */}
              <p
                className="btn btn-dark rounded-circle"
                onClick={() => {
                  previousTrack(accessToken, deviceId);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-skip-start-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0V4z" />
                </svg>
              </p>
              &nbsp;&nbsp;&nbsp;&nbsp;
              {/* PLAY/PAUSE BUTTON */}
              <p
                className="btn btn-dark rounded-circle"
                onClick={() => {
                  paused
                    ? start
                      ? resume(accessToken, deviceId)
                      : play(accessToken, deviceId, selectTrack[0], selectTrack[1], selectTrack[2])
                    : pause(accessToken, deviceId);
                  setStart(true);
                }}
              >
                {paused ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    fill="currentColor"
                    className="bi bi-play-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    fill="currentColor"
                    className="bi bi-pause-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                  </svg>
                )}
              </p>
              &nbsp;&nbsp;&nbsp;&nbsp;
              {/* NEXT BUTTON */}
              <p
                className="btn btn-dark rounded-circle"
                onClick={() => {
                  nextTrack(accessToken, deviceId);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-skip-end-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0V4z" />
                </svg>
              </p>
            </p>
            &nbsp;&nbsp;&nbsp;&nbsp;
            {/* VOLUME BUTTONS */}
            <p className="volume ">
              {/* VOLUME DOWN */}
              <p
                className="btn btn-dark rounded-circle"
                onClick={() => {
                  volumeTrack(accessToken, deviceId, 25);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-volume-down-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zm3.025 4a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z" />
                </svg>
              </p>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <p
                className="btn btn-dark rounded-circle"
                onClick={() => {
                  volumeTrack(accessToken, deviceId, 75);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  fill="currentColor"
                  className="bi bi-volume-up-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
                  <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
                  <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
                </svg>
              </p>
            </p>
          </div>
        </div>
      </nav>

      {/* END OF FOOTER PLAYER */}

      <div>
        <main>
          {/* ARTIST DISPLAY */}
          {/* <div className="flex-grow-1 ms-3 p-2 rounded">
            <img src="http://via.placeholder.com/150x150" alt="..." className="rounded-circle" />
            <p className="fw-bold mt-3 mb-0">Album Name</p>
            <p className="fst-italic ">
              artist &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                fill="currentColor"
                className="bi bi-play-circle play"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
              </svg>
            </p>
          </div> */}

          {/* Ternary condition : if showAlbum is true, then display all albums for an artist, else display an album tracklist */}
          {showAlbum ? (
            <section className="section d-flex">
              <div className="d-flex align-items-center ">
                {albumsArtist.items.map((element: SpotifyTrack) => {
                  return (
                    <ul>
                      <li>
                        <div className="tarck flex-shrink-0 p-2 rounded ">
                          <img src={element.images[1].url} />
                        </div>

                        <p
                          className="btn btn-dark w-100"
                          onClick={() => {
                            setShowAlbum(false);
                            setShowTrackList(true);
                            setSelectAlbum(`${element.id}`);
                          }}
                        >
                          <p className="fw-bold mt-3 mb-0 text-light">{element.name}</p>
                          <hr />
                          <p className="text-light">
                            {element.release_date} - Total tracks : {element.total_tracks}
                          </p>
                        </p>
                      </li>
                    </ul>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="container track-display">
              <br />
              <br />
              <div className="text-dark d-flex align-items-center">
                <div className="p-3">
                  <img src={infosAlbum.images[1].url} />
                </div>
                <div>
                  <h1>
                    <strong>{infosAlbum.name}</strong>
                  </h1>
                  <h5 className="text-secondary">
                    {infosAlbum.artists[0].name} • {infosAlbum.release_date} • {infosAlbum.total_tracks} tracks
                  </h5>
                </div>
              </div>
              <hr className="text-dark" />
              {infosAlbum.tracks.items.map((track: SpotifyTrack, index: number) => {
                return (
                  <ul>
                    {/* Faire le typage du temps de la musique */}
                    <li key={`${track.id}`}>
                      <p
                        className="btn btn-dark"
                        onClick={() => {
                          setSelectTrack(["album", infosAlbum.id, index]);
                        }}
                      >
                        {track.name}
                      </p>
                    </li>
                    <p className="text-dark">Track duration : {parseFloat(track.duration_ms / 60000).toFixed(2)} min</p>
                  </ul>
                );
              })}
              <style jsx>{`
                .track-display {
                  margin-left: 15rem;
                }
                img {
                  margin-bottom: 3rem;
                }
              `}</style>
            </div>
          )}
        </main>
        <br />
        <br />
        <br />
        <br />
        <br />
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
