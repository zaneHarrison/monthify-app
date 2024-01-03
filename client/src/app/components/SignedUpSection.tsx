import localFont from "next/font/local";
import styles from "../styles/SignedUpSection.module.css";
import Button from "./Button";
import Link from "next/link";

const light = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Light.otf",
});

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

export default function SignedUpConfirmation() {
  return (
    <div id="signed-up-section" className={styles.container}>
      <div id="title-text" className={styles.titleTextContainer}>
        <h1 className={bold.className}>
          Success! You’re signed up with Monthify.
        </h1>
      </div>
      <div id="confirmation-text" className={styles.confirmationTextContainer}>
        <p className={light.className}>
          Monthify will now automatically create monthly playlists in your
          Spotify account.
          <br />
          Thank you for signing up!
        </p>
      </div>
      <div id="opt-out-text" className={styles.optOutTextContainer}>
        <p className={light.className}>
          You can opt-out of Monthify <Link href="/opt_out">here</Link>.
        </p>
      </div>
      <Button
        target="_self"
        className="signUpButton"
        text="Back to Home"
        link="/"
      />
    </div>
  );
}
