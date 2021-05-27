import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import "../../style/global.css";


function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string): unknown => fetch(url).then((response) => response.json()),
      }}
    >

      <Component {...pageProps} />{" "}
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.min.js"></script>
    </SWRConfig>
  );
}

export default MyApp;
