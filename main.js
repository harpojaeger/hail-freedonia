$(document).ready( () => {
  const nav = $('ul.nav')
  const selectedCandidateMeta = $('div.selected-candidate-meta')
  const selectedCandidateParty = $('div.selected-candidate-party')
  const selectedCandidateDistrict = $('div.selected-candidate-district')
  const selectedCandidateBio = $('div.selected-candidate-bio')
  const votingControls = $('div.voting-controls')
  const voteConfirmationText = $('div.vote-confirmation-text')
  const voteConfirmationCandidateName = $('span.vote-confirmation-candidate-name')
  const voteButton = $('button.vote-button')

  $(votingControls).on('selectedCandidateUpdated', function(){
    console.log($(this).data())
    let selectedCandidate = $(this).data().selectedCandidate
    $(voteButton)
    .text('Vote for ' + selectedCandidate)
    // need to use display: block so the margins work
    .css('display', 'block')
  })
  .on('confirmCandidate', function() {
    console.log('confirming')
    let candidateName = $(this).data().selectedCandidate
    $(voteConfirmationCandidateName).text(candidateName)
    $(voteConfirmationText).slideDown()
    $(voteButton).text('Yes, I want to vote for ' + candidateName)
    $(this).data('nextAction', 'castVote')
  })
  .on('castVote', function() {
    console.log('voting')
    $(this).trigger('voteProcessed')
  })
  .on('voteProcessed', function () {
    console.log('voted')
    // Hide
    $(votingControls).slideUp()
    // Freeze the nav
    $(nav).children().each(function() {
      $(this)
      .unbind('click')
      .css({cursor: 'auto'})
    })
    // Freeze the selected candidate in color
    $('li.selected-candidate').css({
      'background-color': '#009905',
      'color' : 'white'
    })
    // easter egg!
    .dblclick( () => {
      window.location.href="https://www.youtube.com/watch?v=wiUlDEw9yLY"
    })
    // Replace the candidate description with a confirmation message.
    $(selectedCandidateMeta).slideUp(400, function(){
      $(this)
      .text('Thank you! Your vote has been recorded.')
      .show()
    })
  })

  $(voteButton).click( () => {
    let data = $(votingControls).data()
    console.log(data)
    // run the next action (confirmCandidate or castVote)
    $(votingControls).trigger(data.nextAction)
  })

  $.ajax("candidates.csv", {dataType: "text"})
  .done( (data) => {
    // JSONify the candidate data and sort by last name
    const candidates = $.csv.toObjects(data).sort( (a,b) => {
      if(a.last_name.toUpperCase() < b.last_name.toUpperCase()) return -1
      if(a.last_name.toUpperCase() > b.last_name.toUpperCase()) return 1
      return 0
    })
    $.each(candidates, (i, candidate) => {
      let fullName = candidate.first_name + ' ' + candidate.last_name
      var candidateMeta = $('<li>')
      .addClass('candidate')
      // .addClass('candidate-' +  i)
      .text(fullName)
      .click(function() {
        $(selectedCandidateParty).text("Party: " + candidate.party)
        $(selectedCandidateDistrict).text("District: " + candidate.electoral_district)
        $(selectedCandidateBio).text(candidate.bio)
        $('li.candidate').removeClass('selected-candidate')
        $(this).addClass('selected-candidate')
        $(votingControls)
        .data({
          selectedCandidate: fullName,
          nextAction: 'confirmCandidate',
        })
        .trigger('selectedCandidateUpdated')
        $(voteConfirmationText).slideUp()
      })
      .appendTo(nav)
    })
  })
})
