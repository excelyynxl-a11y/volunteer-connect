#!/usr/bin/env bash

set -eu
set -o pipefail

if ! command -v npm >/dev/null 2>&1; then
  node_version="${NODE_VERSION:-22.17.0}"
  node_distribution="node-v${node_version}-linux-x64"
  node_archive="${node_distribution}.tar.gz"
  node_cache_dir="${CI_PROJECT_DIR}/.node"
  node_install_dir="${node_cache_dir}/${node_distribution}"
  node_download_url="https://nodejs.org/dist/v${node_version}"

  download_file() {
    source_url="$1"
    destination="$2"

    if command -v curl >/dev/null 2>&1; then
      curl --fail --silent --show-error --location "$source_url" --output "$destination"
    elif command -v wget >/dev/null 2>&1; then
      wget --quiet "$source_url" --output-document="$destination"
    else
      echo "Neither curl nor wget is available to download Node.js." >&2
      return 1
    fi
  }

  if [ ! -x "${node_install_dir}/bin/npm" ]; then
    mkdir -p "$node_cache_dir"
    download_file "${node_download_url}/${node_archive}" "${node_cache_dir}/${node_archive}"
    download_file "${node_download_url}/SHASUMS256.txt" "${node_cache_dir}/SHASUMS256.txt"

    (
      cd "$node_cache_dir"
      grep " ${node_archive}$" SHASUMS256.txt | sha256sum --check -
      tar -xzf "$node_archive"
    )

    rm -f "${node_cache_dir}/${node_archive}" "${node_cache_dir}/SHASUMS256.txt"
  fi

  export PATH="${node_install_dir}/bin:${PATH}"
fi

echo "Using Node.js $(node --version) and npm $(npm --version)"
