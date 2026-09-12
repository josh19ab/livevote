process.env.HOSTNAME = "0.0.0.0";
process.env.PORT = process.env.PORT || "8080";

require("child_process").spawn(
  process.execPath,
  [require("path").join(__dirname, "..", ".next", "standalone", "server.js")],
  { stdio: "inherit", env: process.env },
).on("exit", (code) => process.exit(code ?? 0));
