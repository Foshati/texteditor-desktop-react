import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { invoke } from "@tauri-apps/api";
import "xterm/css/xterm.css";
import "./Terminal.css";



function Terminal() {
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    const initTerminal = async () => {
      const term = new XTerm({
        fontFamily: "MesloLGS NF",
        cursorStyle: "bar",
        cursorBlink: true,
        theme: {
          background: "black",
          foreground: "#DCDCDD",
          cursor: "#ffaa08",
          selectionBackground: "rgba(74, 143, 114, 0.3)",
        },
        allowTransparency: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      terminalInstanceRef.current = term;
      fitAddonRef.current = fitAddon;

      await initShell();
      term.onData(writeToPty);
      window.addEventListener("resize", fitTerminal);
      fitTerminal();
      readFromPty();
    };

    initTerminal();

    return () => {
      window.removeEventListener("resize", fitTerminal);
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
      }
    };
  }, []);

  const fitTerminal = async () => {
    if (fitAddonRef.current && terminalInstanceRef.current) {
      fitAddonRef.current.fit();
      await invoke("async_resize_pty", {
        rows: terminalInstanceRef.current.rows,
        cols: terminalInstanceRef.current.cols,
      });
    }
  };

  const writeToTerminal = async (data) => {
    return new Promise((resolve) => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.write(data, () => resolve());
      } else {
        resolve();
      }
    });
  };

  const writeToPty = (data) => {
    invoke("async_write_to_pty", { data });
  };

  const initShell = async () => {
    try {
      await invoke("async_create_shell");
      await writeToPty("bash\n");
    } catch (error) {
      console.error("Error creating shell:", error);
    }
  };

  const readFromPty = async () => {
    const data = await invoke("async_read_from_pty");
    if (data) {
      await writeToTerminal(data);
    }
    window.requestAnimationFrame(readFromPty);
  };

  return (
    <div className="Terminal">
      <div
        id="terminal"
        ref={terminalRef}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></div>
    </div>
  );
}

export default Terminal;