DIRS=$(find ./tasks -depth -type d | awk -F / 'NF>=p; {p=NF}')
while IFS= read -r DIR; do
    CUT=${DIR:8}
    TASK=${CUT////:}

    SUMMARY=""
    SUMMARY_FILE=${DIR}/SUMMARY
    if [ -f "${SUMMARY_FILE}" ]; then
      SUMMARY=$(awk 'NR==1' "${SUMMARY_FILE}")
      echo "${TASK} (${SUMMARY})"
    else
      echo "${TASK}"
    fi

done <<< "${DIRS}"
