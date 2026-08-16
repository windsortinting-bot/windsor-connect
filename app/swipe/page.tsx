const fetchProfiles = async (currentUserId: string) => {
  // 1. Get current user's preferences
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("target_gender, gender")
    .eq("id", currentUserId)
    .single();

  // 2. Get already swiped users
  const { data: swiped } = await supabase
    .from("swipes")
    .select("target_id")
    .eq("swiper_id", currentUserId);

  const swipedIds = (swiped ?? []).map((s) => s.target_id);

  // 3. Build the query
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("is_onboarded", true)
    .neq("id", currentUserId)
    .order("created_at", { ascending: false })
    .limit(30);

  // Filter by who they want to see
  if (myProfile?.target_gender && myProfile.target_gender !== "everyone") {
    query = query.eq("gender", myProfile.target_gender);
  }

  // Don't show people they've already swiped on
  if (swipedIds.length > 0) {
    query = query.not("id", "in", `(${swipedIds.join(",")})`);
  }

  const { data } = await query;
  setProfiles(data ?? []);
  setLoading(false);
};