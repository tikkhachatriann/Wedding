class SearchManager{

    constructor(searchButton, queryInput, searchResults, searchModal){
        this.searchButton = searchButton;
        this.queryInput = queryInput;
        this.searchResults = searchResults;
        this.searchModal = searchModal;
    }


    init() {
        
        this.searchButton.click(this.handleSearch.bind(this));
        
        $(".close").click(() => this.searchModal.css("display", "none"));
        $(window).click(event => {
            if (event.target === this.searchModal[0]) {
                this.searchModal.css("display", "none");
            }
        });
    }


    handleSearch() {

        const query = this.queryInput.val().trim();

        if (query.length >= 3) {
            $.ajax({
                url: "/search",
                type: "GET",
                data: { query: query }, 
                success: response => {
                    if (response === 'No matching record found') {
                        alert("Նշված տվյալներով հյուր չի գտնվել");
                    } else {
                        this.searchResults.html(response);
                        console.log(response)
                        this.searchModal.css("display", "block");
                    }
                }
            });
        } else {
            alert("Նշեք ամբողջական տվյալները");
        }
    }
}


class TableManager{
    
    constructor(tableButtons, tableModal, tableResults) {
        this.tableButtons = tableButtons;
        this.tableModal = tableModal;
        this.tableResults = tableResults;
    }


    init() {
        
        // this.tableButtons.click(this.handleTables.bind(this));
        
        $(".close").click(() => this.tableModal.css("display", "none"));
        $(window).click(event => {
            if (event.target === this.tableModal[0]) {
                this.tableModal.css("display", "none");
            }
        });
    }


    // handleTables(event) {
        
    //     const tableId = $(event.currentTarget).data("table-id");
        
    //     $.ajax({
    //         url: "/guests/" + tableId,
    //         type: "GET",
    //         data: { table_id: tableId }, 
    //         success: response => {
    //             this.tableResults.html(response);
    //             this.tableModal.css("display", "block");
    //         },
    //         error: function(xhr, status, error){
    //             alert("Error: " + xhr.responseText);
    //         }
    //     });
    // }
}


class ConfirmationManager{

    displayConfirmation(guestId, message) {
        
        const confirmationMessageId = `#confirmationMessage_${guestId}`;
        
        $(confirmationMessageId).html(
            `<span class="confirmation-message">${message}</span>`
        );
    }


    hideModalAfterDelay(searchModal){
        
        setTimeout(
            function(){searchModal.css('display', 'none'); },
            3000
        );
    }

}


function initializeApp(){
    
    const searchButton = $('#searchButton');
    const queryInput = $('#query');
    const searchResults = $('#searchResults');
    const searchModal = $('#search-modal');
    const tableButtons = $(".table-button");
    const tableModal = $("#tables-modal");
    const tableResults = $("#tables-results");

    const searchManager = new SearchManager(
        searchButton,
        queryInput,
        searchResults,
        searchModal
    ); 
    searchManager.init();
    
    const tableManager = new TableManager(
        tableButtons,
        tableModal,
        tableResults
    );
    tableManager.init();
    
    const confirmationManager = new ConfirmationManager();

    $(document).on("click", ".confirm-button", function() {
        
        const guestId = $(this).data("guest-id");
        
        $.ajax({
            url: "/confirm_guest",
            type: "POST",
            contentType: "application/json",
            data : JSON.stringify({ guest_id: guestId}),
            success: response => {
                const { message } = response;

                confirmationManager.displayConfirmation(guestId, message);

                $(this).closest('.chair').addClass("confirmed");
                
                confirmationManager.hideModalAfterDelay(searchModal);
            },
            error: function(xhr, status, error){
                alert("Error: " + xhr.responseText);
            }
        });
    });

}


$(document).ready(initializeApp)


document.addEventListener("DOMContentLoaded", function() {
    
    const tables = document.querySelectorAll(".table");
    
    tables.forEach(table => {
        const chairs = table.querySelector(".chairs");
        const numChairs = chairs.children.length;
        const radius = 100; 
        const chairSize = 25; 

        const angleIncrement = (2 * Math.PI) / numChairs;

        for (let i = 0; i < numChairs; i++) {
           
            const angle = i * angleIncrement;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            const chair = chairs.children[i];
            
            chair.style.width = chairSize + "px";
            chair.style.height = chairSize + "px";
            chair.style.left = x + "px";
            chair.style.top = y + "px";
        }
    });
});

