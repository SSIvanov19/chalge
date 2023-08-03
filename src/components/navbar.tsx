export default function Navbar({
  onClickOverHelpIcon,
  onClickLeaderboardIcon,
}: {
  onClickOverHelpIcon: () => void;
  onClickLeaderboardIcon: () => void;
}) {
  return (
    <nav className="w-fill flex h-20 items-center justify-between border-b-2 lg:justify-around">
      <div className="hidden w-0 lg:block lg:w-1/3"></div>
      <div className="flex w-1/3 items-center justify-center pl-2 lg:pl-0">
        <h1 className="font-inter text-4xl font-bold text-main lg:text-5xl">
          Chalge
        </h1>
      </div>
      <div className="flex w-1/3 items-center justify-end space-x-6 pr-6 lg:p-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="54"
          height="54"
          viewBox="0 0 54 54"
          fill="none"
          className="w-10 cursor-pointer lg:w-auto"
          onClick={onClickOverHelpIcon}
        >
          <path
            d="M24 42.664H29.3333V37.331H24V42.664ZM26.6667 0C11.9467 0 0 11.9459 0 26.665C0 41.3841 11.9467 53.33 26.6667 53.33C41.3867 53.33 53.3333 41.3841 53.3333 26.665C53.3333 11.9459 41.3867 0 26.6667 0ZM26.6667 47.997C14.9067 47.997 5.33333 38.4243 5.33333 26.665C5.33333 14.9057 14.9067 5.333 26.6667 5.333C38.4267 5.333 48 14.9057 48 26.665C48 38.4243 38.4267 47.997 26.6667 47.997ZM26.6667 10.666C20.7733 10.666 16 15.439 16 21.332H21.3333C21.3333 18.3989 23.7333 15.999 26.6667 15.999C29.6 15.999 32 18.3989 32 21.332C32 26.665 24 25.9984 24 34.6645H29.3333C29.3333 28.6649 37.3333 27.9983 37.3333 21.332C37.3333 15.439 32.56 10.666 26.6667 10.666Z"
            fill="#474747"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="54"
          height="54"
          viewBox="0 0 54 54"
          fill="none"
          className="w-10 cursor-pointer lg:w-auto"
          onClick={onClickLeaderboardIcon}
        >
          <path
            d="M14.6658 53.33H0V17.7767H14.6658V53.33ZM33.9979 0H19.3321V53.33H33.9979V0ZM53.33 23.7022H38.6643V53.33H53.33V23.7022Z"
            fill="#474747"
          />
        </svg>
      </div>
    </nav>
  );
}
