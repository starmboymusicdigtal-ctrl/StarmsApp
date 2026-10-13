
async function loadPeople() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,display_name')
    .neq('id', currentUser.id)
    .order('display_name');

  if (error) {
    showMessage('Imeshindikana kupata watumiaji: ' + error.message);
    return;
  }

  const box = $('#scPeople');
  box.replaceChildren();

  if (!data.length) {
    box.textContent = 'Bado hakuna watumiaji wengine. Mtu mwingine ajisajili kwanza.';
    return;
  }

  for (const person of data) {
    const button = document.createElement('button');
    button.textContent = person.display_name || 'Mtumiaji';
    button.style.cssText =
      'display:block;width:100%;text-align:left;padding:12px;margin:4px 0;' +
      'background:#222;color:white;border:1px solid #444;border-radius:10px';

    button.onclick = async () => {
      selectedUser = person;
      $('#scTitle').textContent = person.display_name || 'Mazungumzo';
      await loadMessages();
    };

    box.appendChild(button);
  }
}

async function loadMessages() {
  if (!selectedUser) return;

  const { data, error } = await supabase
    .from('messages')
    .select('id,sender_id,recipient_id,body,created_at')
    .or(
      `and(sender_id.eq.${currentUser.id},recipient_id.eq.${selectedUser.id}),` +
      `and(sender_id.eq.${selectedUser.id},recipient_id.eq.${currentUser.id})`
    )
    .order('created_at');

  if (error) {
    showMessage('Imeshindikana kusoma ujumbe: ' + error.message);
    return;
  }

  const box = $('#scMessages');
  box.replaceChildren();

  for (const message of data) {
    const item = document.createElement('div');
    item.textContent =
      (message.sender_id === currentUser.id ? 'Mimi: ' : 'Yeye: ') +
      message.body;
    item.style.cssText =
      'padding:10px;margin:7px 0;max-width:90%;overflow-wrap:anywhere;' +
      'background:' +
      (message.sender_id === currentUser.id ? '#493e12' : '#252525') +
      ';border-radius:12px';
    box.appendChild(item);
  }

  box.scrollTop = box.scrollHeight;
}

async function startApp() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    showMessage(error.message);
    return;
  }

  currentUser = data.session?.user;

  if (!currentUser) {
    ensureAuthPanel();
    return;
  }

  try {
    await ensureProfile();
    removeAuthPanel();
    addChatUI();

    $('#starmsChatPanel').style.display = 'flex';
    await loadPeople();

    const openChat = async () => {
      $('#starmsChatPanel').style.display = 'flex';
      await loadPeople();
    };

    if ($('#newChat')) $('#newChat').onclick = openChat;
    if ($('#discoverBtn')) $('#discoverBtn').onclick = openChat;

    if (channel) await supabase.removeChannel(channel);

    channel = supabase
      .channel('starms-messages-' + currentUser.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const m = payload.new;

          if (
            selectedUser &&
            (
              (m.sender_id === selectedUser.id &&
               m.recipient_id === currentUser.id) ||
              (m.sender_id === currentUser.id &&
               m.recipient_id === selectedUser.id)
            )
          ) {
            await loadMessages();
          }

          await loadPeople();
        }
      )
      .subscribe();

  } catch (error) {
    showMessage('StarmsApp: ' + (error.message || String(error)));
  }
}

async function boot() {
  if (!url || !key) {
    showMessage(
      'Kagua config.js. Inahitajika Supabase Project URL na Publishable key sahihi.'
    );
    return;
  }

  supabase = createClient(url, key);

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    () => {
      setTimeout(() => startApp(), 0);
    }
  );

  await startApp();
}

boot();

