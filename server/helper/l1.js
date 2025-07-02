const buildSearchQuery = (search) => {
  if (!search) return {};

  const searchRegex = { $regex: search, $options: "i" };

  return {
    $or: [
      { email: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { contactNumber: searchRegex },
    ],
  };
};

const buildSortCriteria = (sortBy, sortOrder) => {
  const sortOptions = {
    name: { "Profile.firstName": sortOrder, "Profile.lastName": sortOrder },
    email: { email: sortOrder },
    status: { status: sortOrder },
    dateOfJoining: { dateOfJoining: sortOrder },
    default: { createdAt: sortOrder },
  };

  return sortOptions[sortBy] || sortOptions.default;
};

module.exports = { buildSearchQuery, buildSortCriteria };
