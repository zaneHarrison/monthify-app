import localFont from "next/font/local";
import styles from "../styles/OptOutSection.module.css";
import Button from "./Button";

const light = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Light.otf",
});

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

export default function OptOutConfirmation() {
  return (
    <div id="opt-out-section" className={styles.container}>
      <div id="title-text" className={styles.titleTextContainer}>
        <h1 className={bold.className}>
          You've successfully opted out of Monthify.
        </h1>
      </div>
      <div id="confirmation-text" className={styles.confirmationTextContainer}>
        <p className={light.className}>
          We're sorry to see you go!
          <br /> If you change your mind and want to sign up again, you can do
          so anytime.
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
