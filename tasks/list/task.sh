ENTRIES=$(find ./tasks -depth -type d | awk -F / 'NF>=p; {p=NF}')

while IFS= read -r ENTRY; do
    CUT=${ENTRY:8}
    echo "${CUT////:}"
done <<< "${ENTRIES}"
