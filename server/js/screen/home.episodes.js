home.episodes = {
  id: "home_episodes-screen",
  previous: NaN,
  data: {
    seasons: NaN,
    episodes: NaN,
  },
};

home.episodes.init = function (item) {
  var episode_contents = document.createElement("div");
  episode_contents.className = `${home.episodes.id} ${home.episodes.id}_content`;

  episode_contents.innerHTML = `
  <div class="option seasons">
    <div class="title resize">${item.title}</div>
    <div class="seasons-list"></div>
  </div>
  <div class="option episodes active">
    <div class="title"></div>
    <div class="episodes-list"></div>
  </div>
  `;

  $(`#${home.id}`).append(episode_contents);

  service.seasons({
    data: {
      id: item.id,
    },
    success: function (response) {
      home.episodes.data.seasons = mapper.seasons(response);
      var seasons_html = "";
      home.episodes.data.seasons.forEach((season, index) => {
        seasons_html += `
        <div class="season${index === 0 ? " selected" : ""}">${
          season.title
        }</div>`;
      });
      $(".seasons .seasons-list").eq(0).html(seasons_html);
      home.episodes.load(home.episodes.data.seasons[0]);
    },
    error: function (error) {
      console.log(error);
    },
  });

  $(`body`).addClass(`${home.episodes.id}`);

  home.episodes.previous = main.state;
  main.state = home.episodes.id;
};

home.episodes.load = function (season) {
  $(".episodes .title")[0].innerText = season.title;
  $(".episodes .episodes-list")[0].slick &&
    $(".episodes .episodes-list")[0].slick.destroy();
  service.episodes({
    data: {
      id: season.id,
    },
    success: function (response) {
      home.episodes.data.episodes = mapper.episodes(response);
      var episodes_html = "";
      home.episodes.data.episodes.forEach((episode) => {
        episodes_html += `
        <div class="episode">
          <div class="episode-image">
            <img data-lazy="${episode.background}">
          </div>
          <div class="episode-details">
            <div class="episode-title">${episode.title}</div>
            <div class="episode-description">${episode.description}</div>
          </div>
        </div>`;
      });
      for (var index = 0; index < 4; index++) {
        episodes_html += `
        <div class="episode">
          <div class="episode-image">
            <img data-lazy="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=">
          </div>
        </div>`;
      }
      $(".episodes .episodes-list").eq(0).html(episodes_html);

      $(".episodes .episodes-list").slick({
        lazyLoad: "ondemand",
        vertical: true,
        dots: false,
        arrows: false,
        infinite: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        speed: 200,
      });
    },
    error: function (error) {
      console.log(error);
    },
  });
};

home.episodes.destroy = function () {
  $(`body`).removeClass(`${home.episodes.id}`);
  setTimeout(() => {
    $(`body`).removeClass(`${home.episodes.id}`);
    $(`.${home.episodes.id}`).remove();
    main.state = home.episodes.previous;
  }, 400);
};

home.episodes.keyDown = function (event) {
  switch (event.keyCode) {
    case tvKey.KEY_BACK:
    case 27:
      home.episodes.destroy();
      break;
    case tvKey.KEY_LEFT:
      var options = $(
        `.${home.episodes.id}.${home.episodes.id}_content .option`
      );
      var current = options.index(
        $(`.${home.episodes.id}.${home.episodes.id}_content .option.active`)
      );
      options.removeClass("active");
      options.eq(current > 0 ? current - 1 : current).addClass("active");
      break;
    case tvKey.KEY_RIGHT:
      var options = $(
        `.${home.episodes.id}.${home.episodes.id}_content .option`
      );
      var current = options.index(
        $(`.${home.episodes.id}.${home.episodes.id}_content .option.active`)
      );
      options.removeClass("active");
      options
        .eq(current < options.length - 1 ? current + 1 : current)
        .addClass("active");
      break;
    case tvKey.KEY_UP:
      var options = $(
        `.${home.episodes.id}.${home.episodes.id}_content .option`
      );
      var current = options.index(
        $(`.${home.episodes.id}.${home.episodes.id}_content .option.active`)
      );
      if (current > 0) {
        $(".episodes .episodes-list")[0].slick.prev();
      } else {
        options = $(`.seasons-list .season`);
        current = options.index($(`.seasons-list .season.selected`));
        options[0].style.marginTop = `${
          current < options.length - 3
            ? (current - 5) * -70 < 15
              ? (current - 5) * -70
              : 15
            : -1120
        }px`;
        options.removeClass("selected");
        var newCurrent = current > 0 ? current - 1 : current;
        options.eq(newCurrent).addClass("selected");
        home.episodes.load(home.episodes.data.seasons[newCurrent]);
      }
      break;
    case tvKey.KEY_DOWN:
      var options = $(
        `.${home.episodes.id}.${home.episodes.id}_content .option`
      );
      var current = options.index(
        $(`.${home.episodes.id}.${home.episodes.id}_content .option.active`)
      );
      if (current > 0) {
        $(".episodes .episodes-list")[0].slick.next();
      } else {
        options = $(`.seasons-list .season`);
        current = options.index($(`.seasons-list .season.selected`));
        options[0].style.marginTop = `${
          current - 3 > 0
            ? (current - 3) * -70 > -1120
              ? (current - 3) * -70
              : -1120
            : 15
        }px`;
        options.removeClass("selected");
        var newCurrent = current < options.length - 1 ? current + 1 : current;
        options.eq(newCurrent).addClass("selected");
        home.episodes.load(home.episodes.data.seasons[newCurrent]);
      }
      break;
    case tvKey.KEY_ENTER:
    case tvKey.KEY_PANEL_ENTER:
      var options = $(
        `.${home.episodes.id}.${home.episodes.id}_content .option`
      );
      var current = options.index(
        $(`.${home.episodes.id}.${home.episodes.id}_content .option.active`)
      );
      if (current > 0) {
        video.init(
          home.episodes.data.episodes[
            $(".episodes .episodes-list")[0].slick.currentSlide
          ]
        );
      }
      break;
  }
};
