export const highlightSearchTerms = (
  text: string,
  searchQuery: string,
): React.ReactElement | string => {
  if (!searchQuery || !text) {
    return text;
  }

  const query = searchQuery.trim().toLowerCase();
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-1 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

export const getSearchableText = (message: any): string => {
  const searchableFields: string[] = [];

  if (message.body) searchableFields.push(message.body);
  if (message.contact?.name) searchableFields.push(message.contact.name);
  if (message.contact?.phone_number)
    searchableFields.push(message.contact.phone_number);
  if (message.address) searchableFields.push(message.address);

  return searchableFields.join(" ").toLowerCase();
};
