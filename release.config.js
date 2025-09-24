export default {
  branches: ["main", { name: "alpha", prerelease: true }, "next-major"],
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits" }],
    [
      "@semantic-release/exec",
      {
        prepareCmd: "yarn build",
      },
    ],
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git",
  ],
};
