import dummyData from '../dropdown/DummyDropdownData';

export const loadDropdownOptions = (field) => {
  if (!field || !field.dropdown || !field.dropdown.source) {
    console.debug('DropdownService: no dropdown/source defined on field', field?.id || field?.name);
    return [];
  }
  let sourceName = field.dropdown.source;
  // fallback names
  if (!sourceName) sourceName = field.dropdownName || field.dropdown.sourceName || '';

  // try exact key, then case-insensitive match
  let data = dummyData[sourceName];
  if (!data) {
    const lower = sourceName.toLowerCase();
    const foundKey = Object.keys(dummyData).find(k => k.toLowerCase() === lower);
    if (foundKey) data = dummyData[foundKey];
  }

  if (!data) {
    console.debug(`DropdownService: no dummy data for source '${sourceName}'`);
    return [];
  }

  // Map object array to structured option objects: { value, label, raw }
  const mapped = data.map(item => {
    if (!item) return { value: '', label: '' , raw: item };
    let value = '';
    let label = '';
    if (item.id !== undefined) value = String(item.id);
    else if (item.code !== undefined) value = String(item.code);
    else if (item.userId !== undefined) value = String(item.userId);
    else if (item.firstName && item.lastName) value = `${item.firstName} ${item.lastName}`;
    else value = (typeof item === 'string') ? item : JSON.stringify(item);

    if (item.description) label = item.description;
    else if (item.name) label = item.name;
    else if (item.firstName && item.lastName) label = `${item.firstName} ${item.lastName}`;
    else if (typeof item === 'string') label = item;
    else label = value;

    return { value, label, raw: item };
  });
  console.debug(`DropdownService: loaded ${mapped.length} options for '${sourceName}'`, mapped.slice(0, 20));
  return mapped;
};
