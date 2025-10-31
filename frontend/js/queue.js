/* Todo:
- Uncomment line in buildBaseQueueItem() to account for multiple artists when backend is connected
- Get the accurate currentUserId instead of using a placeholder
- Make vote counts match to color of vote button
- Need 4 vote button styles: unpressed, unpressed hover, pressed, pressed hover
- Need pressed to be more different from unpressed
- Need to uncomment queueItem.upvotes when backend is connected
- Make it so that only track metadata is shown on each queue item initially, then when the item is clicked,
  either the item is pushed up or the items below it are pushed down, and then the vote buttons are displayed.
  I'm not sure if it would be better to have the vote numbers here or not too. If the track was requested by the current user,
  then don't allow this mini menu to open up on that queue item.
- Make it so the text for each queue item scrolls back and forth if it is too long to fit into the area
- Change sendVote() to update DOM through websockets instead of full reload
- Change loadQueue()'s fetch call to not send currentUserId once session or JWT is set up
*/

// URL for fetching the queue data
const queueUrl = 'https://coffee-shop-jukebox.onrender.com/api/queue';

// URL for sending the votes
const voteUrl = 'https://coffee-shop-jukebox.onrender.com/api/vote';

// Temporary placeholder id of the user currently loading the queue or sending the vote
currentUserId = 0;

// Will contain the list of queue items
const queueContainer = document.getElementById('queue-container');

// Will be displayed if the queue is empty
const emptyMessage = document.getElementById('queue-empty');

async function loadQueue() {
    try {
        const response = await fetch(`${queueUrl}?userId=${currentUserId}`);    // Send a GET request to /api/queue endpoint with the current user id
        if (!response.ok) {                                                     // If response has an HTTP status code not in 200 range, then throw error
            throw new Error('Failed to fetch queue');
        }

        const data = await response.json();                                     // Convert response to json
        const queueItems = data.items || [];

        queueContainer.innerHTML = '';                                          // Initially set queue to empty

        if (queueItems.length === 0) {                                          // If there are no queue items
            emptyMessage.classList.remove('d-none');                            // Then display the 'empty' message and exit
            return;
        }

        emptyMessage.classList.add('d-none');                                   // Now that we know there are queue items, make sure 'empty' message is not displayed

        queueItems.forEach(queueItem => renderQueueItem(queueItem));            // Render each queue item
    } catch (err) {
        console.error(err);
        emptyMessage.textContent = "Error loading queue.";                      // Set the 'empty' message to display error feedback
        emptyMessage.classList.remove('d-none');                                // Display the message
    }
}

function renderQueueItem(queueItem) {
    const queueCard = buildBaseQueueItem(queueItem);
    applySkipStyle(queueCard, queueItem);

    // Get upvote and downvote buttons
    const upButton = queueCard.querySelector('.upvote');
    const downButton = queueCard.querySelector('.downvote');
    
    applyHideUserRequestVoteButtons(queueItem, upButton, downButton);
    applyPreviousVoteStyle(queueItem, upButton, downButton);
    attachVotePressHandlers(queueItem, upButton, downButton);
    queueContainer.appendChild(queueCard);
}

// Build html queue card with queue item's metadata separated from vote buttons
function buildBaseQueueItem(queueItem) {
    const queueCard = document.createElement('div');
    queueCard.className = 'list-group-item d-flex justify-content-between align-items-center';
    queueCard.innerHTML = `
        <div>
            <img src="${queueItem.coverArtUrl}" class="me-2" style="width:40px;height:40px;object-fit:cover;" />
            <strong>${queueItem.title || 'Unknown Title'}</strong>
            <!-- If multiple artists, then join by ', ' -->
            <div class="text-muted small">
                ${Array.isArray(queueItem.artists) ? queueItem.artists.join(', ') : 'Unknown Artist'}
            </div>
            <div class="text-muted small">${queueItem.releaseName || 'Unknown Release'}</div>
        </div>
        <div class="d-flex">
            <div class="vote-stack me-2">
                <button class="upvote btn btn-sm btn-outline-success">▲</button>
                <div class="vote-count upvote-count">${queueItem.upvotes ?? 0}</div>
            </div>
            <div class="vote-stack">
                <button class="downvote btn btn-sm btn-outline-danger">▼</button>
                <div class="vote-count downvote-count">${queueItem.downvotes ?? 0}</div>
            </div>
        </div>
    `;
    return queueCard;
}

// Reduce opacity of queue items that will be skipped
function applySkipStyle(queueCard, queueItem) {
    if (queueItem.willBeSkipped) {
        queueCard.classList.add('opacity-50');
    }
}

// Hide the vote buttons on the queue items requested by the current user
function applyHideUserRequestVoteButtons(queueItem, upButton, downButton) {
    if (queueItem.requestedBy === currentUserId) {
        upButton.classList.add('d-none');
        downButton.classList.add('d-none');
    }
}

// Mark vote buttons as pressed if user has already voted on that queue item
function applyPreviousVoteStyle(queueItem, upButton, downButton) {
    if (queueItem.myVote === true) {
        upButton.classList.add('pressed');
    }
    if (queueItem.myVote === false) {
        downButton.classList.add('pressed');
    }
}

// Attach click event listeners to the upvote and downvote buttons
// A click event sends the vote with the queue item's id and vote type
function attachVotePressHandlers(queueItem, upButton, downButton) {
    upButton.addEventListener('click', async () => {
        await sendVote(queueItem.id, true);
        upButton.classList.toggle('pressed');
        downButton.classList.remove('pressed');
    });
    downButton.addEventListener('click', async () => {
        await sendVote(queueItem.id, false);
        downButton.classList.toggle('pressed');
        upButton.classList.remove('pressed');
    });
}

// Sends vote data to backend (attaches current user id to the request)
async function sendVote(queueItemId, isUpvote) {
    try {
        // Send a POST request to /api/vote endpoint
        const res = await fetch(voteUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, queueItemId, isUpvote })
        });
        // If response has an HTTP response code not in 200 range, throw an error
        if (!res.ok) {
            throw new Error('Vote failed');
        }

        // For now: Reload queue from server
        loadQueue();

        // Later: Update DOM without full reload (through a realtime websockets update)

    } catch (err) {
        console.error('Vote error:', err);
    }
}

// Mirror "Now Playing" with first queue item
function mirrorNowPlayingFromFirstItem() {
    const first = document.querySelector('#queue-container .list-group-item');
    const np = document.querySelector('.nowplaying');
    if (!first || !np) return;

    const title = first.querySelector('strong')?.textContent?.trim() || 'Song Title';
    const byline = first.querySelector('.text-muted.small')?.textContent?.trim() || 'Artist — Album';
    const img = first.querySelector('img')?.src || 'https://via.placeholder.com/72';

    np.querySelector('img').src = img;
    np.querySelector('.title strong').textContent = title;
    np.querySelector('.byline').textContent = byline;
}

// Refresh Queue & Mirror
async function refreshQueue() {
    await loadQueue();
    mirrorNowPlayingFromFirstItem();
}

// Auto-refresh every 10s
const AUTO_REFRESH_MS = 10000;
setInterval(() => {
    if (document.hasFocus()) {
        refreshQueue();
    }
}, AUTO_REFRESH_MS);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadQueue().then(mirrorNowPlayingFromFirstItem);
});