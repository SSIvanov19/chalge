import Head from "next/head";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Navbar from "~/components/navbar";
import { useLocalStorage } from "~/services/localStorageService";

export default function Home() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isFirstTimeVisit") === null) {
      setIsInfoModalOpen(true);
      localStorage.setItem("isFirstTimeVisit", "false");
    }
  }, []);

  return (
    <>
      <Transition appear show={isInfoModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setIsInfoModalOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Как да играем?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Всеки ден трябва да познаеш нова чалга песен. За целта
                      трябва да познаете нейното име, изпълнители (може да са
                      повече от един), година на издаване, албум (не всяка песен
                      има) и локация на заснемане (не всяка песен има) (може да
                      са повече от една).
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsInfoModalOpen(false)}
                    >
                      Окей, благодаря!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Head>
        <title>Chalge</title>
        <meta
          name="description"
          content="A fun game where you need to guess a new chalga song every day."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar
        onClickOverHelpIcon={() => {
          setIsInfoModalOpen(true);
        }}
      />
      <main className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center space-y-6">
        <div className="h-52 w-96 rounded-2xl bg-[#D9D9D9]" />
        <div className="lg:space-x-4 flex flex-col lg:flex-row lg:space-y-0 space-y-4 items-center justify-center">
          <input
            type="text"
            id="inputBox"
            className="w-[24rem] border-b-2 text-center font-inter text-2xl text-main placeholder:text-center focus:outline-none"
            placeholder="Опитай се да познаеш ..."
          />
          <button className="w-fit rounded-lg border-2 pl-2 pr-2 font-inter text-2xl text-main focus:outline-none">
            Провери
          </button>
        </div>
        <hr />
        <div className="w-[24rem] lg:w-[33rem] font-inter text-2xl text-main">
          <p className="cursor-default">Име: </p>
          <hr />
        </div>
        <div className="w-[24rem] lg:w-[33rem] font-inter text-2xl text-main">
          <p className="cursor-default">Изпълнители (0/3): </p>
          <hr />
        </div>
        <div className="w-[24rem] lg:w-[33rem] font-inter text-2xl text-main">
          <p className="cursor-default">Година на издаване:</p>
          <hr />
        </div>
        <div className="w-[24rem] lg:w-[33rem] font-inter text-2xl text-main">
          <p className="cursor-default">Албум:</p>
          <hr />
        </div>
        <div className="w-[24rem] lg:w-[33rem] font-inter text-2xl text-main">
          <p className="cursor-default">Локация на заснемане (0/2):</p>
          <hr />
        </div>
      </main>
      {/* footer for information */}
    </>
  );
}
